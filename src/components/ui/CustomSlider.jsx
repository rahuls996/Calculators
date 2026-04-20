export function CustomSlider({
  min,
  max,
  value,
  step = 1,
  className = 'custom-slider',
  onValueChange,
  ...rest
}) {
  const minN = Number(min);
  const maxN = Number(max);
  const valN = Number(value);
  const pct = maxN === minN ? 0 : ((valN - minN) / (maxN - minN)) * 100;

  return (
    <input
      type="range"
      className={className}
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ '--slider-progress': `${pct}%` }}
      onChange={(e) => onValueChange(Number(e.target.value))}
      {...rest}
    />
  );
}
