const ytWidgetRule = /\[YOUTUBE@VID\]\((\S+)\)/
const duneWidgetRule = /\[DUNE@EMBED\]\((\S+)\)/

export const CreateWidget = (rule: RegExp, template: string) => {
  return {
    rule,
    toDOM(text: string) {
      const matched = text.match(rule)
      if (!matched) return null

      const container = document.createElement('div')
      container.classList.add('embed-widget-iframe')

      const iframe = document.createElement('iframe')
      iframe.src = template.replace('$1', matched[1])
      iframe.onload = () => {
        container.classList.add('embed-widget-iframe__loaded')
      }

      container.appendChild(iframe)

      return container
    },
  }
}

const ytWidget = CreateWidget(ytWidgetRule, 'https://www.youtube.com/embed/$1')

const duneWidget = CreateWidget(duneWidgetRule, 'https://dune.com/embeds/$1')

export const widgetRules = [ytWidget, duneWidget]
