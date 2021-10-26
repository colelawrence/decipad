import plural from 'pluralize';

export function TimeUnitsResult({
  value: entries,
}: {
  value: [string, number][];
}): JSX.Element {
  return (
    <>
      [ {entries.map(([name, val]) => `${val} ${plural(name, val)}`).join(', ')}{' '}
      ]
    </>
  );
}
