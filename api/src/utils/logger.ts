export class Logger {
  label: string;
  forceShow: boolean | undefined;

  constructor(name: string, forceShow?: boolean) {
    this.label = `[${new Date().toISOString()}] ${name}`;
    this.forceShow = forceShow;
    if (this.forceShow === true /* || IsDev */) console.time(this.label);
  }

  end(): void {
    if (this.forceShow === true /* || IsDev */) console.timeEnd(this.label);
  }
}

/**
 * Times a block of (possibly async) work, replacing the `new Logger(label); ...; log.end();`
 * pair with a single call. A decorator can't express this: the timed spans in this codebase
 * are sub-expressions inside promise chains (query phase, then conversion phase), not whole
 * method bodies, so wrapping the block directly is the shape that actually fits.
 */
export function Timed<T>(label: string, fn: () => T, forceShow?: boolean): T {
  const log = new Logger(label, forceShow);
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => { log.end(); }) as T;
  }

  log.end();
  return result;
}
