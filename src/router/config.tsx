
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const Home = lazy(() => import('../pages/home/page'));
const Channels = lazy(() => import('../pages/channels/page'));
const Analysis = lazy(() => import('../pages/analysis/page'));
const Query = lazy(() => import('../pages/query/page'));
const Connect = lazy(() => import('../pages/connect/page'));
const MindMap = lazy(() => import('../pages/mindmap/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/channels',
    element: <Channels />
  },
  {
    path: '/analysis',
    element: <Analysis />
  },
  {
    path: '/query',
    element: <Query />
  },
  {
    path: '/connect',
    element: <Connect />
  },
  {
    path: '/mindmap',
    element: <MindMap />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
