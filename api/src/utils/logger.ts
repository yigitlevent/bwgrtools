// TODO: function decorators would make this 1000 times easier
export class Logger {
  label: string;
  forceShow: boolean | undefined;

  constructor(name: string, forceShow?: boolean) {
    this.label = `[${new Date().toISOString()}] ${name}`;
    this.forceShow = forceShow;
    if (this.forceShow /* || IsDev */) console.time(this.label);
  }

  end(): void {
    if (this.forceShow /* || IsDev */) console.timeEnd(this.label);
  }
}
