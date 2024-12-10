import { AnyProxyFactoryConfig, ProxyFormsByKey } from './types';
import { SliderVariableForm, sliderVariableConfig } from './sliderVariable';
import { GenericVariableForm, genericVariableConfig } from './genericVariable';
import { ResultForm, resultConfig } from './result';
import {
  DropdownVariableForm,
  dropdownVariableConfig,
} from './dropdownVariable';
import { MetricForm, metricConfig } from './metric';
import { dateVariableConfig, DateVariableForm } from './dateVariable';

// The first proxy factory that matches all selected nodes will be used
export const proxyFactories = [
  dateVariableConfig,
  sliderVariableConfig,
  dropdownVariableConfig,
  genericVariableConfig,
  resultConfig,
  metricConfig,
] satisfies AnyProxyFactoryConfig[];

export const proxyFormsByKey: ProxyFormsByKey<typeof proxyFactories> = {
  dateVariable: DateVariableForm,
  sliderVariable: SliderVariableForm,
  dropdownVariable: DropdownVariableForm,
  genericVariable: GenericVariableForm,
  result: ResultForm,
  metric: MetricForm,
};
