import styles from "./EngineMeasurementValue.module.css";

const POWER_READING_PATTERN = /[+-]?[\d.,]+\s*(?:kW|hp|bhp)\s*@\s*[+-]?[\d.,]+(?:\s*[-–—]\s*[+-]?[\d.,]+)?\s*(?:rpm|r\/min)\b/gi;
const TORQUE_READING_PATTERN = /[+-]?[\d.,]+\s*(?:lb[\s-]*ft|n\s*·?\s*m)\s*@\s*[+-]?[\d.,]+(?:\s*[-–—]\s*[+-]?[\d.,]+)?\s*(?:rpm|r\/min)\b/gi;
const READING_SEPARATORS = /^[\s,;/|]*$/;

const READING_PATTERNS = {
  power: POWER_READING_PATTERN,
  torque: TORQUE_READING_PATTERN,
};

function splitMeasurementString(value, measurement) {
  const normalizedValue = value.trim();
  const readingPattern = READING_PATTERNS[measurement];

  if (!normalizedValue) {
    return [];
  }

  if (!readingPattern) {
    return [normalizedValue];
  }

  const readings = normalizedValue.match(readingPattern);

  if (!readings || readings.length < 2) {
    return [normalizedValue];
  }

  const remainingText = normalizedValue.replace(readingPattern, "");

  if (!READING_SEPARATORS.test(remainingText)) {
    return [normalizedValue];
  }

  return readings.map((reading) => reading.trim());
}

export function getEngineMeasurementLines(value, measurement) {
  const values = Array.isArray(value) ? value : [value];

  const lines = values.flatMap((item) => {
    if (item === undefined || item === null) {
      return [];
    }

    return splitMeasurementString(String(item), measurement);
  });

  return lines.length > 0 ? lines : ["No data"];
}

export default function EngineMeasurementValue({ value, measurement }) {
  const lines = getEngineMeasurementLines(value, measurement);

  return (
    <span className={styles.measurementValue}>
      {lines.map((line, index) => (
        <span className={styles.measurementLine} key={`${line}-${index}`}>
          {line}
        </span>
      ))}
    </span>
  );
}
