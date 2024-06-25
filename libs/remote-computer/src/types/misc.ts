import type { Observable } from 'rxjs';
import type { Computer, Program } from '@decipad/computer-interfaces';

export type Subjected<T> = T extends Observable<infer U> ? U : never;

export interface GetRemoteComputerOptions {
  notebookId: string;
  onError?: (error: Error) => void;
  initialProgram?: Program;
}

export type RemoteComputerClient = Computer & {
  terminate: () => void;
};
