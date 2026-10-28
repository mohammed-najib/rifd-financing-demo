import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent } from 'react';

export type SelectOption = { value: string; label: string; disabled?: boolean };
type SelectProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'value' | 'onChange' | 'type' | 'onClick'
> & {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
};

// A controlled, single-choice listbox. Focus stays on the labelled trigger.
export function Select({
  id,
  label,
  value,
  options,
  onValueChange,
  disabled,
  ref,
  className = '',
  ...props
}: SelectProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', time: 0 });
  const [popup, setPopup] = useState<{
    style: CSSProperties;
    above: boolean;
    host: HTMLElement;
  } | null>(null);
  const [active, setActive] = useState(0);
  const blocked = disabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  const listId = `${id}-options`;
  const selected = options.find(option => option.value === value);
  useImperativeHandle(ref, () => trigger.current!);

  useEffect(() => {
    if (!popup) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !menu.current?.contains(event.target)
      )
        setPopup(null);
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > innerHeight) {
        setPopup(null);
        return;
      }
      // Browsers may finish scrolling a focused field after its menu opens.
      // Follow the field instead of dismissing a keyboard selection mid-action.
      setPopup(current => {
        if (!current) return null;
        const next = position();
        return JSON.stringify(current.style) === JSON.stringify(next.style) ? current : next;
      });
    };
    const close = () => setPopup(null);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [popup]);

  useEffect(() => {
    if (blocked) setPopup(null);
  }, [blocked]);
  useLayoutEffect(() => {
    if (!popup) return;
    const option = document.getElementById(`${listId}-${active}`);
    const list = menu.current;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [popup, active, listId]);

  function position() {
    const button = trigger.current!;
    const rect = button.getBoundingClientRect();
    const height = Math.min(options.length * 44 + 12, 320);
    const below = innerHeight - rect.bottom - 16,
      above = rect.top - 16;
    const opensAbove = below < height && above > below;
    const width = Math.min(Math.max(rect.width, 200), innerWidth - 24);
    const left = Math.max(
      12,
      Math.min(
        getComputedStyle(button).direction === 'rtl' ? rect.right - width : rect.left,
        innerWidth - width - 12,
      ),
    );
    return {
      host: button.closest('dialog') ?? document.body,
      above: opensAbove,
      style: {
        left,
        width,
        maxHeight: Math.max(44, Math.min(320, opensAbove ? above : below)),
        ...(opensAbove ? { bottom: innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
      },
    };
  }
  function show(index = options.findIndex(option => option.value === value && !option.disabled)) {
    if (blocked || !options.some(option => !option.disabled)) return;
    setActive(index >= 0 ? index : options.findIndex(option => !option.disabled));
    setPopup(position());
  }
  function choose(index: number) {
    if (blocked || !options[index] || options[index].disabled) return;
    setPopup(null);
    trigger.current?.focus({ preventScroll: true });
    if (options[index].value !== value) onValueChange(options[index].value);
  }
  function move(offset: number) {
    for (let step = 1; step <= options.length; step++) {
      const index = (active + offset * step + options.length) % options.length;
      if (!options[index].disabled) {
        setActive(index);
        return;
      }
    }
  }
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || blocked || event.ctrlKey || event.metaKey || event.altKey) return;
    const { key } = event;
    if (key === 'Tab') {
      setPopup(null);
      return;
    }
    if (key === 'Escape' && popup) {
      event.preventDefault();
      event.stopPropagation();
      setPopup(null);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (popup) choose(active);
      else show();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (popup) move(key === 'ArrowDown' ? 1 : -1);
      else show();
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      const index =
        key === 'Home'
          ? options.findIndex(option => !option.disabled)
          : options.reduce((last, option, index) => (option.disabled ? last : index), -1);
      if (popup) setActive(index);
      else show(index);
    } else if (key.length === 1 && !event.nativeEvent.isComposing) {
      const normalize = (text: string) =>
        text.toLocaleLowerCase().replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632));
      const now = Date.now(),
        text = normalize(now - typed.current.time < 700 ? typed.current.text + key : key);
      typed.current = { text, time: now };
      const index = options.findIndex(
        option => !option.disabled && normalize(option.label).startsWith(text),
      );
      if (index >= 0) {
        event.preventDefault();
        if (popup) setActive(index);
        else show(index);
      }
    }
  }

  return (
    <>
      <button
        {...props}
        id={id}
        ref={trigger}
        type="button"
        role="combobox"
        className={`select-trigger ${className}`}
        disabled={disabled}
        aria-label={label}
        aria-expanded={!!popup}
        aria-haspopup="listbox"
        aria-controls={popup ? listId : undefined}
        aria-activedescendant={popup ? `${listId}-${active}` : undefined}
        data-value={value}
        onKeyDown={onKeyDown}
        onClick={() => (popup ? setPopup(null) : show())}
        onBlur={event => {
          props.onBlur?.(event);
          setPopup(null);
        }}
      >
        <span className="select-value">{selected?.label ?? value}</span>
        <svg
          className="select-chevron"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {popup &&
        !blocked &&
        createPortal(
          <div
            ref={menu}
            id={listId}
            className="select-menu"
            style={popup.style}
            dir={getComputedStyle(trigger.current!).direction}
            role="listbox"
            aria-label={label}
            data-placement={popup.above ? 'above' : 'below'}
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                className="select-option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                data-value={option.value}
                data-active={index === active}
                onPointerMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onPointerDown={event => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                <svg
                  className="select-check"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 8 3 3 7-7" />
                </svg>
              </div>
            ))}
          </div>,
          popup.host,
        )}
    </>
  );
}
