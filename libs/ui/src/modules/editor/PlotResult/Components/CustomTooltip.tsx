/** @jsxImportSource @emotion/react */
import { MenuSeparator } from 'libs/ui/src/shared';
import { JellyBean } from 'libs/ui/src/shared/atoms/Jellybeans/Jellybeans';
import { FC } from 'react';
import { formatNumbersForCharts, prettyPercentage } from '../helpers';
import {
  chartToolTipStyle,
  contextStyle,
  negativePercentageLabel,
  positivePercentageLabel,
  quarterCircleStyle,
  seriesBeanAndValueStyles,
  seriesContainerStyle,
  seriesLabelStyle,
  tooltipLabelStyles,
  valueStyle,
} from './styles';
import {
  CustomTooltipWithGrowth,
  CustomTooltipWithGrowthProps,
  CustomTooltipWithTotal,
  RechartPayloadProps,
  ScatterTooltipProps,
  TooltipAtomProps,
} from './types';

const TooltipAtom: FC<TooltipAtomProps> = ({
  iconStyle,
  name,
  value,
  context,
}) => {
  return (
    <div css={seriesContainerStyle}>
      <div css={seriesLabelStyle}>
        <div css={seriesBeanAndValueStyles}>
          <JellyBean
            text={name.toString()}
            backgroundColor="transparent"
            icon={iconStyle ? <span css={iconStyle} /> : null}
          />
          <div css={valueStyle}>
            {typeof value === 'number' ? formatNumbersForCharts(value) : value}
          </div>
        </div>
        {context && <div css={contextStyle}>{context}</div>}
      </div>
    </div>
  );
};

const filterSeenNames = (
  payload?: RechartPayloadProps
): NonNullable<RechartPayloadProps> => {
  const seenNames = new Set<string | number>();
  return (payload || []).filter((entry) => {
    if (!entry?.name) {
      return false;
    }
    if (seenNames.has(entry.name)) {
      return false;
    }
    seenNames.add(entry.name);
    return true;
  });
};

const ScatterTooltip: FC<ScatterTooltipProps> = (opts) => {
  const { payload } = opts;
  const filteredPayload = filterSeenNames(payload);
  return (
    <>
      {filteredPayload.map((entry, index) => {
        if (
          !(
            entry.name &&
            (typeof entry.value === 'string' || typeof entry.value === 'number')
          )
        ) {
          return <></>;
        }
        return (
          <TooltipAtom
            key={`item-${entry.name}-tooltip-${index}`}
            name={entry.name}
            value={entry.value}
          />
        );
      })}
    </>
  );
};

const PieTooltip: FC<CustomTooltipWithTotal> = ({ total, payload }) => {
  return (
    <>
      {payload.map((entry, index) => {
        const { value, name, payload: payloadNest } = entry;

        const iconStyle = quarterCircleStyle(payloadNest.fill ?? '#CCC');
        if (name && value)
          return (
            <TooltipAtom
              key={`item-${name}-tooltip-${index}`}
              name={name}
              value={Array.isArray(value) ? value.join(',') : value}
              iconStyle={iconStyle}
              context={
                typeof value === 'number' && total !== undefined ? (
                  <p>{prettyPercentage({ value, total })} of total</p>
                ) : null
              }
            />
          );
        return null;
      })}
    </>
  );
};

const DefaultTooltip: FC<CustomTooltipWithGrowth> = ({ payload, growth }) => {
  const filteredPayload = filterSeenNames(payload);

  return (
    <>
      {filteredPayload.map((entry, index) => {
        const iconStyle = quarterCircleStyle(entry.color ?? '#CCC');
        if (
          entry.name &&
          (typeof entry.value === 'string' || typeof entry.value === 'number')
        ) {
          const growthForEntry = growth && growth[entry.name];

          return (
            <TooltipAtom
              key={`item-${entry.name}-tooltip-${index}`}
              name={entry.name}
              value={entry.value}
              iconStyle={iconStyle}
              context={
                growthForEntry ? (
                  <p>
                    <span
                      // eslint-disable-next-line decipad/css-prop-named-variable
                      css={
                        growthForEntry > 0
                          ? positivePercentageLabel
                          : negativePercentageLabel
                      }
                    >
                      {growthForEntry}%
                    </span>{' '}
                    vs. previous
                  </p>
                ) : null
              }
            />
          );
        }
        return null;
      })}
    </>
  );
};

const TooltipLabel = ({ label }: { label: string }) => {
  return (
    <>
      <MenuSeparator />
      <div css={tooltipLabelStyles}>{label}</div>
    </>
  );
};

const ScatterLabel: FC<ScatterTooltipProps> = ({
  payload,
  labelColumnName,
}) => {
  if (!labelColumnName) {
    return null;
  }
  const cuteLabel = payload[0]?.payload?.[labelColumnName];
  return cuteLabel && <TooltipLabel label={cuteLabel} />;
};

export const CustomTooltip = (props: CustomTooltipWithGrowthProps) => {
  const { active, payload, label, type, growth } = props;
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div css={chartToolTipStyle}>
      {type === 'Scatter' ? (
        <>
          <ScatterTooltip payload={payload} />
          <ScatterLabel
            payload={payload}
            labelColumnName={props.labelColumnName}
          />
        </>
      ) : type === 'Pie' ? (
        <PieTooltip type="Pie" payload={payload} total={props.total} />
      ) : (
        <DefaultTooltip type="Default" payload={payload} growth={growth} />
      )}
      {label != null && type !== 'Scatter' ? (
        <TooltipLabel label={label} />
      ) : null}
    </div>
  );
};
