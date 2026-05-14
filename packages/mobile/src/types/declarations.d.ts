declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    multiRemove(keys: string[]): Promise<void>;
    clear(): Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    children?: React.ReactNode;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module 'react-native-svg' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
  }

  export default class Svg extends Component<SvgProps> {}
  export class Circle extends Component<any> {}
  export class Rect extends Component<any> {}
  export class Path extends Component<any> {}
  export class Line extends Component<any> {}
  export class G extends Component<any> {}
  export class Text extends Component<any> {}
}
