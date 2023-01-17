import { useSelectableContext } from '@decipad/react-utils';
import { ReactNode, useEffect, useRef } from 'react';
import {
  NameSyncContext,
  ColumnGroupName,
} from './BlockLengthSynchronizationProvider';

/**
 * Measures self, sends length to BlockLengthSynchronizationProvider.
 * Also receives length from BlockLengthSynchronizationProvider.
 *
 * These two are not contradictory because it renders two nested elements:
 * a "width receiver" and a "measurable" which have independent widths.
 */
export const BlockLengthSynchronizationReceiver = ({
  syncGroupName,
  topLevelBlockId,
  children,
}: {
  /** Which column does this visually align with */
  syncGroupName: ColumnGroupName;
  /** The block ID this name identifies, findable in editor.children[*].id */
  topLevelBlockId: string | undefined;
  /** PlainText node from slate-react */
  children: ReactNode;
}) => {
  const { minWidth, setMeasuredLength } = useSelectableContext(
    NameSyncContext,
    ({ targetWidths: targetLengths, ...rest }) => ({
      minWidth:
        topLevelBlockId && targetLengths.get(topLevelBlockId)?.[syncGroupName],
      ...rest,
    })
  );
  const measurableRef = useRef<HTMLSpanElement | null>(null);

  // Provide our own length to BlockLengthSynchronizationProvider
  useEffect(() => {
    if (!measurableRef.current || !topLevelBlockId) {
      return;
    }

    // Use a ResizeObserver to report changes of measurableRef's size
    const report = () => {
      const width = measurableRef.current?.getBoundingClientRect()?.width;
      setMeasuredLength(syncGroupName, topLevelBlockId, width ?? 0);
    };

    // Initial report
    report();

    const observer = new ResizeObserver(report);
    observer.observe(measurableRef.current);

    return () => {
      setMeasuredLength(syncGroupName, topLevelBlockId, undefined);
      observer.disconnect();
    };
  }, [syncGroupName, topLevelBlockId, setMeasuredLength, children]);

  return (
    <span css={{ display: 'inline-block' }} style={{ minWidth }}>
      <span css={{ whiteSpace: 'nowrap' }} ref={measurableRef}>
        {children}
      </span>
    </span>
  );
};
