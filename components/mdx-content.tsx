/* eslint-disable react-hooks/static-components */
'use client';

import * as runtime from 'react/jsx-runtime';
import type { ComponentType } from 'react';

const sharedComponents: Record<string, ComponentType> = {};

const componentCache = new Map<string, ComponentType>();

type MDXComponents = Record<string, ComponentType<{ children?: React.ReactNode }>>;

const getMDXComponent = (code: string) => {
  const cached = componentCache.get(code);
  if (cached) return cached;
  const fn = new Function(code);
  const Component = fn({ ...runtime }).default as ComponentType<{ components?: MDXComponents }>;
  componentCache.set(code, Component);
  return Component;
};

type MDXProps = {
  code: string;
  components?: MDXComponents;
};

export const MDXContent = ({ code, components }: MDXProps) => {
  const Component = getMDXComponent(code);
  return <Component components={{ ...sharedComponents, ...components }} />;
};
