import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <StropheText
        style={[styles.tabLabel, { color: focused ? Colors.gold : Colors.whiteDim }]}
      >
        {label}
      </StropheText>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="level"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="LEVEL" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="PROFIL" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
  },
  tabIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabIconActive: {
    backgroundColor: Colors.borderGold,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
