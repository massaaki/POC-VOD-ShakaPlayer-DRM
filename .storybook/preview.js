import '../src/themes/global.scss';
import { renderWithConfigs } from '../src/utils/tests/helpers';
import { addDecorator } from '@storybook/react'
import { RouterContext } from 'next/dist/next-server/lib/router-context'

addDecorator((storyFn) => (
  <RouterContext.Provider
    value={{
      route: "/",
      pathname: '/',
      asPath: '/',
      query: {},
      basePath: '',
      reload: () => { },
      prefetch: async () => { },
      back: () => { },
      beforePopState: () => { },
      isFallback: false,
    }}
  >
    {storyFn()}
  </RouterContext.Provider>
))

export const decorators = [
  (Story) => renderWithConfigs(<Story />, 'storybook')
]
