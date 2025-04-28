import api from './api';
import { performance } from 'perf_hooks';
import CacheManager from './cache-manager';

// 모니터링 데이터 가져오기
export const fetchMonitoringData = async (interval, courseId, assignmentId, userId) => {
  const cacheKey = `${interval}_${courseId}_${assignmentId}_${userId}`;
  const cache = CacheManager.getCache('monitoringData');
  
  try {
    // 캐시된 결과가 있으면 반환하되, stale-while-revalidate 패턴을 위해 
    // 백그라운드에서 새로운 데이터를 가져오도록 cachedFetch 사용
    const result = await CacheManager.cachedFetch(
      cacheKey,
      async () => {
        //console.log(`[API] 모니터링 데이터 요청 (interval: ${interval}, courseId: ${courseId}, assignmentId: ${assignmentId}, userId: ${userId || 'all'})`);
        const apiStartTime = performance.now();
        
        const endpoint = userId
          ? `/courses/${courseId}/assignments/${assignmentId}/monitoring/${userId}?interval=${interval}`
          : `/courses/${courseId}/assignments/${assignmentId}/monitoring?interval=${interval}`;
        
        const response = await api.get(endpoint);
        
        const apiEndTime = performance.now();
        //console.log(`[API] 모니터링 데이터 응답 완료 (${apiEndTime - apiStartTime}ms, 데이터 크기: ${response.data?.trends?.length || 0}점)`);
        
        return response.data;
      },
      'monitoringData',
      300000 // 5분 캐시
    );
    
    return result;
  } catch (error) {
    //console.error('[API 오류] 모니터링 데이터 요청 실패:', error);
    
    // 오류 발생 시 캐시에서 가져오기 시도
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      //console.log('[캐시 사용] API 오류 복구를 위해 캐시된 데이터 사용');
      return cachedData;
    }
    
    throw error;
  }
}; 