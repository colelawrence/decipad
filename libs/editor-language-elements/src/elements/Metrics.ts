import { ELEMENT_METRIC } from '@decipad/editor-types';
import type { InteractiveLanguageElement } from '../types';
import { assertElementType } from '@decipad/editor-utils';
import { flattenedAggregationTypes } from '@decipad/language-aggregations';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { getExprRef } from '@decipad/computer';
import { Program } from '@decipad/computer-interfaces';

export const Metric: InteractiveLanguageElement = {
  type: ELEMENT_METRIC,
  getParsedBlockFromElement: (_editor, _computer, element) => {
    assertElementType(element, ELEMENT_METRIC);
    const programs: Program[] = [];

    const usedAggregation =
      element.aggregation != null
        ? flattenedAggregationTypes[
            element.aggregation as keyof typeof flattenedAggregationTypes
          ]
        : undefined;
    const usedComparisonAggregation =
      element.comparisonAggregation != null
        ? flattenedAggregationTypes[
            element.comparisonAggregation as keyof typeof flattenedAggregationTypes
          ]
        : undefined;

    // What to do with sum: ''?
    const usedAggregationExpression = usedAggregation?.expression(
      getExprRef(element.blockId),
      { sum: '' }
    );
    const usedComparisonAggregationExpression =
      usedComparisonAggregation?.expression(
        getExprRef(element.comparisonBlockId),
        { sum: '' }
      );

    const comparisonId = `${element.id}-comparison`;

    if (usedAggregationExpression != null) {
      programs.push(
        parseElementAsVariableAssignment(
          element.id,
          getExprRef(element.id),
          usedAggregationExpression
        )
      );
    } else {
      programs.push(
        parseElementAsVariableAssignment(
          element.id,
          getExprRef(element.id),
          getExprRef(element.blockId)
        )
      );
    }

    if (usedComparisonAggregationExpression != null) {
      programs.push(
        parseElementAsVariableAssignment(
          comparisonId,
          getExprRef(comparisonId),
          usedComparisonAggregationExpression
        )
      );
    } else {
      programs.push(
        parseElementAsVariableAssignment(
          comparisonId,
          getExprRef(comparisonId),
          getExprRef(element.comparisonBlockId)
        )
      );
    }

    const trendId = `${element.id}-trend`;

    programs.push(
      parseElementAsVariableAssignment(
        trendId,
        getExprRef(trendId),
        `trend([${
          usedComparisonAggregationExpression ??
          getExprRef(element.comparisonBlockId)
        }, ${usedAggregationExpression ?? getExprRef(element.blockId)}])`
      )
    );

    return programs.flat();
  },
};
