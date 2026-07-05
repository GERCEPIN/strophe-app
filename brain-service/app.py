import modal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import numpy as np
import io

app = modal.App("strophe-brain-analysis")

service_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsm6", "libxext6", "git")
    .pip_install(
        "tribev2 @ git+https://github.com/facebookresearch/tribev2.git",
        "torch",
        "torchvision",
        "pillow",
        "numpy",
        "imageio",
        "imageio[ffmpeg]",
        "fastapi[standard]",
        "pydantic",
    )
)

# Rough vertex-range → lobe mapping for fsaverage5 (~20484 vertices total).
# Left hemisphere: 0–10241, Right: 10242–20483.
# These ranges are a simplified approximation — enough for a UI display.
REGIONS = [
    {"id": "prefrontal",  "name": "Korteks Prefrontal",   "desc": "Perencanaan & Pengendalian Diri",      "range": (0,    1800)},
    {"id": "frontal",     "name": "Lobus Frontal",         "desc": "Pengambilan Keputusan & Kreativitas",  "range": (1800, 4000)},
    {"id": "temporal",    "name": "Lobus Temporal",        "desc": "Memori & Pemrosesan Bahasa",           "range": (4000, 6500)},
    {"id": "parietal",    "name": "Lobus Parietal",        "desc": "Persepsi Spasial & Integrasi Sensorik","range": (6500, 8500)},
    {"id": "occipital",   "name": "Lobus Oksipital",       "desc": "Pemrosesan Visual",                    "range": (8500, 10242)},
    {"id": "limbic",      "name": "Sistem Limbik",         "desc": "Respons Emosional & Motivasi",         "range": (10242, 13000)},
    {"id": "right_front", "name": "Frontal Kanan",         "desc": "Intuisi & Pemikiran Holistik",         "range": (13000, 17000)},
    {"id": "cerebellum",  "name": "Posterior & Motorik",   "desc": "Koordinasi & Respons Otomatis",        "range": (17000, 20484)},
]


class AnalyzeRequest(BaseModel):
    image_base64: str
    text: str = ""


web_app = FastAPI()


@app.cls(gpu="T4", image=service_image, container_idle_timeout=300)
class BrainAnalyzer:
    @modal.enter()
    def load_model(self):
        from tribev2 import TribeModel
        self.model = TribeModel.from_pretrained(
            "facebook/tribev2", cache_folder="/tmp/tribe_cache"
        )

    @modal.method()
    def analyze(self, image_b64: str, text: str) -> dict:
        import tempfile
        import os
        from PIL import Image
        import imageio.v3 as iio

        img_bytes = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB").resize((224, 224))
        frames = [np.array(img)] * 16  # 2 s at 8 fps — enough for TRIBE

        with tempfile.TemporaryDirectory() as tmp:
            video_path = os.path.join(tmp, "input.mp4")
            iio.imwrite(video_path, frames, fps=8, codec="libx264")

            kwargs: dict = {"video_path": video_path}
            if text.strip():
                text_path = os.path.join(tmp, "input.txt")
                with open(text_path, "w") as f:
                    f.write(text)
                kwargs["text_path"] = text_path

            df = self.model.get_events_dataframe(**kwargs)
            preds, _ = self.model.predict(events=df)

        # preds: (n_timesteps, n_vertices) — average over time, take absolute value
        mean_act = np.abs(preds).mean(axis=0)
        n_verts = len(mean_act)

        if mean_act.max() > 0:
            mean_act = mean_act / mean_act.max()

        regions_out = []
        for r in REGIONS:
            lo, hi = r["range"]
            hi = min(hi, n_verts)
            activation = float(mean_act[lo:hi].mean()) if hi > lo else 0.0
            regions_out.append({
                "id": r["id"],
                "name": r["name"],
                "description": r["desc"],
                "activation": round(activation, 4),
            })

        regions_out.sort(key=lambda x: x["activation"], reverse=True)
        dominant = regions_out[0]["name"] if regions_out else ""

        return {"regions": regions_out, "dominant": dominant, "vertex_count": n_verts}


@app.function(image=service_image)
@modal.web_endpoint(method="POST")
def analyze_endpoint(req: AnalyzeRequest) -> dict:
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")
    analyzer = BrainAnalyzer()
    return analyzer.analyze.remote(req.image_base64, req.text)
