import { router, line } from 'bottender/router';
import { handleLineEvent } from './eventHandler';

/**
 * 建立路由
 */
export default function App() {
  return router([
    // 處理所有 Line 事件
    line.any(handleLineEvent),
  ]);
}



