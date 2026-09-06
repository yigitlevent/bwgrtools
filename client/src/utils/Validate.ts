export function ValidateUsername(username: string): boolean {
  return username.length > 3 && username.length < 65;
}

export function ValidateEmail(email: string): boolean {
  const emailRegexp = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  return emailRegexp.test(email);
}

export function ValidatePassword(password: string): boolean {
  const passwordRegexp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,64}$/g;
  return passwordRegexp.test(password);
}
