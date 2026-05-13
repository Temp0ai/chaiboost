import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ContentStudioScreen } from '../screens/main/ContentStudioScreen';
import { CreateContentScreen } from '../screens/main/CreateContentScreen';
import { ImageGeneratorScreen } from '../screens/main/ImageGeneratorScreen';
import { VideoGeneratorScreen } from '../screens/main/VideoGeneratorScreen';
import { ContentDetailScreen } from '../screens/main/ContentDetailScreen';
import { CalendarScreen } from '../screens/main/CalendarScreen';
import { QueueScreen } from '../screens/main/QueueScreen';
import { SchedulePostScreen } from '../screens/main/SchedulePostScreen';
import { ReviewsListScreen } from '../screens/main/ReviewsListScreen';
import { ReviewDetailScreen } from '../screens/main/ReviewDetailScreen';
import { TrendsScreen } from '../screens/main/TrendsScreen';
import { OverviewScreen } from '../screens/main/OverviewScreen';
import { PostPerformanceScreen } from '../screens/main/PostPerformanceScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  ContentTab: undefined;
  ScheduleTab: undefined;
  EngagementTab: undefined;
  AnalyticsTab: undefined;
};

export type ContentStackParamList = {
  ContentStudio: undefined;
  CreateContent: undefined;
  ImageGenerator: undefined;
  VideoGenerator: undefined;
  ContentDetail: { contentId: string };
};

export type ScheduleStackParamList = {
  Calendar: undefined;
  Queue: undefined;
  SchedulePost: { contentId: string };
};

export type EngagementStackParamList = {
  ReviewsList: undefined;
  ReviewDetail: { reviewId: string };
  Trends: undefined;
};

export type AnalyticsStackParamList = {
  Overview: undefined;
  PostPerformance: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const ContentStack = createNativeStackNavigator<ContentStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const EngagementStack = createNativeStackNavigator<EngagementStackParamList>();
const AnalyticsStack = createNativeStackNavigator<AnalyticsStackParamList>();

const ContentNavigator = () => (
  <ContentStack.Navigator screenOptions={{ headerShown: false }}>
    <ContentStack.Screen name="ContentStudio" component={ContentStudioScreen} />
    <ContentStack.Screen name="CreateContent" component={CreateContentScreen} />
    <ContentStack.Screen name="ImageGenerator" component={ImageGeneratorScreen} />
    <ContentStack.Screen name="VideoGenerator" component={VideoGeneratorScreen} />
    <ContentStack.Screen name="ContentDetail" component={ContentDetailScreen} />
  </ContentStack.Navigator>
);

const ScheduleNavigator = () => (
  <ScheduleStack.Navigator screenOptions={{ headerShown: false }}>
    <ScheduleStack.Screen name="Calendar" component={CalendarScreen} />
    <ScheduleStack.Screen name="Queue" component={QueueScreen} />
    <ScheduleStack.Screen name="SchedulePost" component={SchedulePostScreen} />
  </ScheduleStack.Navigator>
);

const EngagementNavigator = () => (
  <EngagementStack.Navigator screenOptions={{ headerShown: false }}>
    <EngagementStack.Screen name="ReviewsList" component={ReviewsListScreen} />
    <EngagementStack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
    <EngagementStack.Screen name="Trends" component={TrendsScreen} />
  </EngagementStack.Navigator>
);

const AnalyticsNavigator = () => (
  <AnalyticsStack.Navigator screenOptions={{ headerShown: false }}>
    <AnalyticsStack.Screen name="Overview" component={OverviewScreen} />
    <AnalyticsStack.Screen name="PostPerformance" component={PostPerformanceScreen} />
  </AnalyticsStack.Navigator>
);

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ContentTab"
        component={ContentNavigator}
        options={{
          tabBarLabel: 'Content',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="image-plus" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleNavigator}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="EngagementTab"
        component={EngagementNavigator}
        options={{
          tabBarLabel: 'Engage',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsNavigator}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
