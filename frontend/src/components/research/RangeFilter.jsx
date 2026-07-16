/** A labelled Min/Max range input pair, Helium-10 Black-Box style. */
export default function RangeFilter({ label, hint, value = {}, onChange, step }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="field" style={{ minWidth: 150 }}>
      <label title={hint}>{label}</label>
      <div className="row" style={{ gap: 6 }}>
        <input
          className="input"
          type="number"
          step={step}
          placeholder="Min"
          value={value.min ?? ''}
          onChange={set('min')}
        />
        <input
          className="input"
          type="number"
          step={step}
          placeholder="Max"
          value={value.max ?? ''}
          onChange={set('max')}
        />
      </div>
    </div>
  );
}
