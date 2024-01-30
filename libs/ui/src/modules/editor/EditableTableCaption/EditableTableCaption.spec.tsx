import { render, screen } from '@testing-library/react';
import {
  EditableTableCaption,
  shouldShowFormulaDrawer,
} from './EditableTableCaption';

it('renders the text', () => {
  render(
    <EditableTableCaption
      onAddDataViewButtonPress={() => null}
      onAddChartViewButtonPress={() => null}
    >
      TableName
    </EditableTableCaption>
  );

  expect(screen.getByText('TableName')).toBeVisible();
});

describe('shouldShowFormulaDrawer', () => {
  it('should return true when formulaEditor is not null, isCollapsed is false, and tableFormulaEditors has elements', () => {
    const formulaEditor = {};
    const isCollapsed = false;
    const tableFormulaEditors = [{}];

    expect(
      shouldShowFormulaDrawer(formulaEditor, isCollapsed, tableFormulaEditors)
    ).toBe(true);
  });

  it('should return false when formulaEditor is null', () => {
    const formulaEditor = null;
    const isCollapsed = false;
    const tableFormulaEditors = [{}];

    expect(
      shouldShowFormulaDrawer(formulaEditor, isCollapsed, tableFormulaEditors)
    ).toBe(false);
  });

  it('should return false when isCollapsed is true', () => {
    const formulaEditor = {};
    const isCollapsed = true;
    const tableFormulaEditors = [{}];

    expect(
      shouldShowFormulaDrawer(formulaEditor, isCollapsed, tableFormulaEditors)
    ).toBe(false);
  });

  it('should return false when tableFormulaEditors is empty', () => {
    const formulaEditor = {};
    const isCollapsed = false;
    const tableFormulaEditors: any[] = [];

    expect(
      shouldShowFormulaDrawer(formulaEditor, isCollapsed, tableFormulaEditors)
    ).toBe(false);
  });
});
