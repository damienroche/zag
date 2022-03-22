import { mergeProps } from "@ui-machines/core"
import { contains, dataAttr, EventKeyMap, getEventKey, getNativeEvent, validateBlur } from "@ui-machines/dom-utils"
import { getArrowStyle, innerArrowStyle } from "@ui-machines/popper"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isLeftClick } from "@ui-machines/utils"
import { dom } from "./menu.dom"
import { Api, ItemProps, OptionItemProps, Send, Service, State } from "./menu.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const pointerdownNode = state.context.pointerdownNode
  const isSubmenu = state.context.isSubmenu
  const values = state.context.values
  const isOpen = state.hasTag("visible")

  const api = {
    isOpen,
    setParent(parent: Service) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },
    setChild(child: Service) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    isOptionChecked(opts: OptionItemProps) {
      return opts.type === "radio" ? values?.[opts.name] === opts.value : values?.[opts.name].includes(opts.value)
    },
    value: values,
    setValue(name: string, value: any) {
      send({ type: "SET_VALUE", name, value })
    },

    contextTriggerProps: normalize.element<T>({
      "data-part": "trigger",
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (event.pointerType !== "mouse") {
          send({ type: "CONTEXT_MENU_START", point: getEventPoint(evt) })
        }
      },
      onPointerCancel(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onPointerMove(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onPointerUp(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onContextMenu(event) {
        const evt = getNativeEvent(event)
        send({ type: "CONTEXT_MENU", point: getEventPoint(evt) })
        event.preventDefault()
      },
      style: {
        WebkitTouchCallout: "none",
        userSelect: "none",
      },
    }),

    getTriggerItemProps<A extends Api>(childApi: A) {
      return mergeProps(api.getItemProps({ id: childApi.triggerProps.id }), childApi.triggerProps) as T["element"]
    },

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      "data-placement": state.context.currentPlacement,
      type: "button",
      id: dom.getTriggerId(state.context),
      "data-uid": state.context.uid,
      "aria-haspopup": "menu",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen ? true : undefined,
      onPointerMove(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERMOVE",
          target: event.currentTarget,
        })
      },
      onPointerLeave(event) {
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: getEventPoint(evt),
        })
      },
      onPointerDown(event) {
        if (dom.isTriggerItem(event.currentTarget)) {
          event.preventDefault()
          return
        }
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (!isLeftClick(evt) || disabled) return
        send({ type: "TRIGGER_CLICK", target: event.currentTarget })
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          Enter() {
            send("TRIGGER_CLICK")
          },
          Space() {
            send("TRIGGER_CLICK")
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),

    positionerProps: normalize.element<T>({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      style: dom.getPositionerStyle(state.context),
    }),

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: getArrowStyle(),
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow--inner",
      style: innerArrowStyle,
    }),

    contentProps: normalize.element<T>({
      "data-part": "content",
      id: dom.getContentId(state.context),
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: state.context.dir,
      "aria-activedescendant": state.context.activeId ?? undefined,
      "aria-labelledby": dom.getTriggerId(state.context),
      "data-placement": state.context.currentPlacement,
      onBlur(event) {
        const menu = dom.getContentEl(state.context)
        const trigger = dom.getTriggerEl(state.context)

        const exclude = dom.getChildMenus(state.context).concat(dom.getParentMenus(state.context))

        if (trigger && !isSubmenu) {
          exclude.push(trigger)
        }
        const isValidBlur = validateBlur(event, {
          exclude,
          fallback: pointerdownNode,
        })
        if (isValidBlur && !contains(menu, event.relatedTarget)) {
          send("BLUR")
        }
      },
      onPointerEnter() {
        send("MENU_POINTERENTER")
      },
      onKeyDown(event) {
        const activeItem = dom.getActiveItemEl(state.context)
        const isLink = !!activeItem?.matches("a[href]")

        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            send("ARROW_RIGHT")
          },
          Escape() {
            send("ESCAPE")
          },
          Enter() {
            if (isLink) activeItem?.click()
            send("ENTER")
          },
          Space(event) {
            keyMap.Enter?.(event)
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Tab() {},
        }

        const key = getEventKey(event, { dir: state.context.dir })
        const exec = keyMap[key]

        if (exec) {
          const allow = isLink && key === "Enter"
          if (!allow) event.preventDefault()
          exec(event)
        } else {
          const editable = activeItem?.matches("input, textarea, [contenteditable], select")
          const isKeyDownInside = event.currentTarget.contains(event.target as HTMLElement)
          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
          const isSingleKey = event.key.length === 1

          if (isSingleKey && !isModifierKey && isKeyDownInside && !editable) {
            event.preventDefault()
            send({ type: "TYPEAHEAD", key: event.key })
          }
        }
      },
    }),

    separatorProps: normalize.element<T>({
      "data-part": "separator",
      role: "separator",
      "aria-orientation": "horizontal",
    }),

    getItemProps(options: ItemProps) {
      const { id, disabled, valueText } = options
      return normalize.element<T>({
        "data-part": "menuitem",
        id,
        role: "menuitem",
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getContentId(state.context),
        "data-selected": dataAttr(state.context.activeId === id),
        "data-valuetext": valueText,
        onClick(event) {
          if (disabled) return
          send({ type: "ITEM_CLICK", target: event.currentTarget })
        },
        onPointerUp(event) {
          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || disabled) return
          event.currentTarget.click()
        },
        onPointerLeave(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        },
        onPointerMove(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
        },
        onDragStart(event) {
          const isLink = event.currentTarget.matches("a[href]")
          if (isLink) event.preventDefault()
        },
      })
    },

    getItemOptionProps(options: OptionItemProps) {
      const { type, name, disabled, value, onChange } = options
      options.id = options.id ?? options.value
      const checked = api.isOptionChecked(options)
      return Object.assign(
        api.getItemProps(options as any),
        normalize.element<T>({
          "data-part": "menu-option",
          role: `menuitem${type}`,
          "aria-checked": !!checked,
          "data-checked": dataAttr(checked),
          onClick(event) {
            if (disabled) return
            send({ type: "ITEM_CLICK", target: event.currentTarget, option: { value, type, name } })
            onChange?.(!checked)
          },
        }),
      )
    },
  }

  return api
}
