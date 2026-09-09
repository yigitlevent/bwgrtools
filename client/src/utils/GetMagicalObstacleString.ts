export function GetObstacleString(resource: Resource, obstacleDetails: ResourceMagicObstacleDetails[]): string {
  const strs = obstacleDetails.map(v => {
    const desc = v.description !== undefined ? `${v.description}: ` : "";
    if (v.obstacle !== undefined) {
      return `${desc}${v.obstacle.toString()}${v.caret === true ? "^" : ""}`;
    }
    else if (v.abilities !== undefined && v.abilities.length > 0) {
      return `${desc}${v.abilities.map(v => v[1]).join("/")}${v.caret === true ? "^" : ""}`;
    }
    else throw new Error(`How could this be?! ${resource.id.toString()} ${resource.name}`);
  });

  return strs.join("; ");
}
