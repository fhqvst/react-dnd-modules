import { IModule } from '~/types'
import { PriceLadder } from '../modules/PriceLadder'

export function Module(props: IModule) {
  switch (props.type) {
    case 'button':
      return <span>Durr</span>
    case 'greeting':
      return <span>Hello world</span>
    case 'price-ladder':
      return <PriceLadder />
  }
}
