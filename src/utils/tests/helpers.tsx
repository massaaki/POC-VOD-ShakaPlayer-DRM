import I18nProvider from 'next-translate/I18nProvider'
import { render, RenderResult } from '@testing-library/react'
import { NextRouter } from 'next/router'
import { RouterContext } from 'next/dist/next-server/lib/router-context'

import common from '../../../locales/pt-BR/common.json'

export type ConfigRenderToProps = 'jest' | 'storybook'

export const renderWithConfigs = (
  children: React.ReactNode,
  configRenderTo: ConfigRenderToProps = 'jest'
): RenderResult | JSX.Element => {
  switch (configRenderTo) {
    case 'jest':
      return render(withInternacionalization(withLinkMocked(children)))
    case 'storybook':
      return withInternacionalization(children)
  }
}

const withInternacionalization = (children: React.ReactNode): JSX.Element => {
  const languages = {
    common
  }
  return (
    <I18nProvider lang="pt" namespaces={languages}>
      {children}
    </I18nProvider>
  )
}

const withLinkMocked = (children: React.ReactNode): JSX.Element => {
  const mockRouter: NextRouter = {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(false),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    isFallback: false
  }

  return (
    <RouterContext.Provider value={mockRouter}>
      {children}
    </RouterContext.Provider>
  )
}
