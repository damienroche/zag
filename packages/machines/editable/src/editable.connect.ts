import { ariaAttr, dataAttr, EventKeyMap, validateBlur } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./editable.dom"
import { Send, State } from "./editable.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  void state.context.pointerdownNode

  const isEditing = state.matches("edit")

  return {
    isEditing,
    isValueEmpty: state.context.isValueEmpty,

    inputProps: normalize.input<T>({
      "data-part": "input",
      id: dom.getInputId(state.context),
      hidden: !isEditing,
      placeholder: state.context.placeholder,
      disabled: state.context.disabled,
      "aria-disabled": state.context.disabled,
      value: state.context.value,
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getCancelBtnEl(state.context), dom.getSubmitBtnEl(state.context)],
          fallback: state.context.pointerdownNode,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onChange(event) {
        send({ type: "TYPE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape() {
            send("CANCEL")
          },
          Enter(event) {
            if (!event.shiftKey && !event.metaKey) {
              send("ENTER")
            }
          },
        }

        const exec = keyMap[event.key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
    }),

    previewProps: normalize.element<T>({
      "data-part": "preview",
      "data-empty": dataAttr(state.context.isValueEmpty),
      children: state.context.value === "" ? state.context.placeholder : state.context.value,
      hidden: isEditing,
      "aria-disabled": ariaAttr(state.context.disabled),
      tabIndex: state.context.isInteractive && state.context.isPreviewFocusable ? 0 : undefined,
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        send("DBLCLICK")
      },
    }),

    editButtonProps: normalize.button<T>({
      "data-part": "edit-button",
      id: dom.getEditBtnId(state.context),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("EDIT")
      },
    }),

    submitButtonProps: normalize.button<T>({
      "data-part": "submit-button",
      id: dom.getSubmitBtnId(state.context),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize.button<T>({
      "data-part": "cancel-button",
      "aria-label": "Cancel",
      id: dom.getCancelBtnId(state.context),
      type: "button",
      onClick() {
        send("CANCEL")
      },
    }),
  }
}
