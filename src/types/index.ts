export type ToolStatus = 'live' | 'beta' | 'soon';

export type ToolCategory =
  | 'Links'
  | 'Utilities'
  | 'E-Commerce'
  | 'Dev Tools'
  | 'AI & Infra';

export interface Tool {
  id: string;
  name: string;
  subdomain: string;
  url: string;
  category: ToolCategory;
  status: ToolStatus;
  description: string;
  shortcutKey?: string;
}

export type CategoryFilter = 'All' | ToolCategory;

export type Theme = 'dark' | 'light';
