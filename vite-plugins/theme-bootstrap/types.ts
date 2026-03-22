export interface BuildArtifact {
  code: string;
  src: string;
}

export interface ThemeBuildServerState {
  debounceTimer: ReturnType<typeof setTimeout> | undefined;
  devCode: string | undefined;
}
