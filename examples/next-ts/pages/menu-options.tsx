import { Global } from "@emotion/react"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const data = {
  radio: [
    { label: "Ascending", id: "asc" },
    { label: "Descending", id: "desc" },
    { label: "None", id: "none" },
  ],
  checkbox: [
    { label: "Email", id: "email" },
    { label: "Phone", id: "phone" },
    { label: "Address", id: "address" },
  ],
}

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      values: { order: "", type: [] },
      onValuesChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const api = Menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

      <div>
        <button className="menu__trigger" ref={ref} {...api.triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...api.positionerProps}>
          <div className="menu__content" {...api.contentProps}>
            {data.radio.map((item) => {
              const opts = { type: "radio", name: "order", value: item.id } as const
              return (
                <div key={item.id} className="menu__item" {...api.getItemOptionProps(opts)}>
                  {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                </div>
              )
            })}
            <hr />
            {data.checkbox.map((item) => {
              const opts = { type: "checkbox", name: "type", value: item.id } as const
              return (
                <div key={item.id} className="menu__item" {...api.getItemOptionProps(opts)}>
                  {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
