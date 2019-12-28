import * as React from 'react';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import getInputValue from './logic/getInputValue';
import skipValidation from './logic/skipValidation';
import { EVENTS, VALIDATION_MODE } from './constants';
import { FieldName, FieldValues, Mode, ValidationOptions } from './types';

export type EventFunction = (args: any) => any;

interface FieldProps<FormValues extends FieldValues, Name extends FieldName<FormValues>> {
  checked?: boolean;
  onBlur: EventFunction;
  onChange: EventFunction;
  value: FormValues[Name];
}

export type Props<FormValues, Name extends FieldName<FormValues>> = {
  name: Name;
  as?: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  children?: React.ReactNode | ((props: FieldProps<FormValues, Name>) => React.ReactNode);
  rules?: ValidationOptions;
  onChange?: EventFunction;
  onBlur?: EventFunction;
  mode?: Mode;
  onChangeName?: string;
  onBlurName?: string;
  defaultValue?: any;
  control: any;
};

const Controller = <
  FormValues extends FieldValues = FieldValues,
  Name extends FieldName<FormValues> = string,
>({
  name,
  rules,
  as: InnerComponent,
  onChange,
  onBlur,
  onChangeName = VALIDATION_MODE.onChange,
  onBlurName = VALIDATION_MODE.onBlur,
  defaultValue,
  control: {
    defaultValues,
    fields,
    setValue,
    register,
    unregister,
    errors,
    mode: { isOnSubmit, isOnBlur },
    reValidateMode: { isReValidateOnBlur, isReValidateOnSubmit },
    formState: { isSubmitted },
  },
  ...rest
}: Props<FormValues, Name>) => {
  const [value, setInputStateValue] = React.useState(
    isUndefined(defaultValue)
      ? isUndefined(defaultValues[name])
        ? ''
        : defaultValues[name]
      : defaultValue,
  );
  const valueRef = React.useRef(value);
  const isCheckboxInput = isBoolean(value);

  const shouldValidate = (isBlurEvent?: boolean) =>
    !skipValidation({
      hasError: !!errors[name],
      isBlurEvent,
      isOnBlur,
      isOnSubmit,
      isReValidateOnBlur,
      isReValidateOnSubmit,
      isSubmitted,
    });

  const commonTask = (target: any) => {
    const data = getInputValue(target, isCheckboxInput);
    setInputStateValue(data);
    valueRef.current = data;
    return data;
  };

  const eventWrapper = (event: EventFunction, eventName: string) => (
    ...arg: any
  ) => {
    const data = commonTask(event(arg));
    const isBlurEvent = eventName === EVENTS.BLUR;
    setValue(name, data, shouldValidate(isBlurEvent));
  };

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate());
  };

  const handleBlur = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate(true));
  };

  const registerField = () =>
    register(
      Object.defineProperty(
        {
          name,
        },
        'value',
        {
          set(data) {
            setInputStateValue(data);
            valueRef.current = data;
          },
          get() {
            return valueRef.current;
          },
        },
      ),
      { ...rules },
    );

  if (!fields[name]) {
    registerField();
  }

  React.useEffect(() => () => unregister(name), []);

  const props = {
    ...rest,
    ...(onChange
      ? { [onChangeName]: eventWrapper(onChange, EVENTS.CHANGE) }
      : { [onChangeName]: handleChange }),
    ...(isOnBlur || isReValidateOnBlur
      ? onBlur
        ? { [onBlurName]: eventWrapper(onBlur, EVENTS.BLUR) }
        : { [onBlurName]: handleBlur }
      : {}),
    ...(isCheckboxInput ? { checked: value } : { value }),
  };

  if (!InnerComponent && typeof rest.children === 'function') {
    return rest.children({
      checked: isCheckboxInput ? value : undefined,
      value,
      onBlur: onBlur ? eventWrapper(onBlur, EVENTS.BLUR) : handleBlur,
      onChange: onChange ? eventWrapper(onChange, EVENTS.CHANGE) : handleChange,
    });
  }

  return React.isValidElement(InnerComponent) ? (
    React.cloneElement(InnerComponent, props)
  ) : (
    <InnerComponent {...props} />
  );
};

export { Controller };
