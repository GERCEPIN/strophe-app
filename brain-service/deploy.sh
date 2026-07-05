#!/usr/bin/env bash
# Run this once to deploy the brain analysis service to Modal.
# Prerequisite: pip install modal && modal token new
set -e
cd "$(dirname "$0")"
modal deploy app.py
