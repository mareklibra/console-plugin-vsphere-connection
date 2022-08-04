export const parseKeyValue = (config: string, delimiter = '='): { [key: string]: string } => {
  console.log('--- parseKeyValue config: ', config);
  const lines = config.split('\n');

  const result: { [key: string]: string } = {};
  lines.forEach((line) => {
    const idx = line.indexOf(delimiter);
    if (idx > 0) {
      const key = line.substring(0, idx).trim();
      let value = line.substring(idx + 1).trim();

      if (value.charAt(0) === '"') value = value.substring(1);
      if (value.charAt(value.length - 1) === '"') value = value.substring(0, value.length - 1);
      result[key] = value;
    }
  });

  return result;
};
