export function bankCreateRef(taskId: string) {
  return `bank:task_create:${taskId}`;
}

export function bankCompleteRef(taskId: string) {
  return `bank:task_complete:${taskId}`;
}

export function bankCancelRef(taskId: string) {
  return `bank:task_cancel:${taskId}`;
}

export function repCompleteRef(taskId: string) {
  return `rep:task_complete:${taskId}`;
}
