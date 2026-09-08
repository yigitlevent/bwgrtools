export function CreateInitialStats(): Record<string, StatData> {
  return {
    "Will": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
    "Perception": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
    "Power": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
    "Agility": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
    "Forte": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
    "Speed": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
  };
}
