// 싱글톤 패턴으로 구현된 캐시 매니저
const CacheManager = (() => {
  // 프라이빗 변수들
  const caches = {};
  const pendingRequests = {};
  const subscribers = {}; // 데이터 변경 구독자
  
  // 기본 캐시 설정
  const defaultSettings = {
    expiry: 300000, // 5분으로 증가
    cleanupInterval: 60000 // 1분마다 정리
  };
  
  // 캐시 생성
  const createCache = (name, settings = {}) => {
    if (caches[name]) return caches[name];
    
    const cacheSettings = { ...defaultSettings, ...settings };
    
    caches[name] = {
      data: {},
      settings: cacheSettings,
      timer: null,
      
      // 캐시 데이터 설정
      set(key, value) {
        const oldValue = this.data[key]?.value;
        const isUpdate = oldValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(value);
        
        this.data[key] = {
          value,
          timestamp: Date.now(),
          stale: false
        };
        
        // 자동 정리 타이머 시작
        this.startCleanupTimer();
        
        // 구독자에게 변경 알림
        if (isUpdate && subscribers[key]) {
          subscribers[key].forEach(callback => {
            try {
              callback(value, oldValue);
            } catch (error) {
              //console.error('구독자 콜백 오류:', error);
            }
          });
        }
        
        return value;
      },
      
      // 캐시 데이터 조회
      get(key) {
        const item = this.data[key];
        if (!item) return null;
        
        // 만료 체크
        if (Date.now() - item.timestamp > this.settings.expiry) {
          // 완전히 삭제하지 않고 stale(오래된) 표시만 함
          this.data[key].stale = true;
        }
        
        return item.value;
      },
      
      // 캐시 항목이 오래되었는지 확인
      isStale(key) {
        const item = this.data[key];
        if (!item) return true;
        
        return item.stale || (Date.now() - item.timestamp > this.settings.expiry);
      },
      
      // 캐시 항목 삭제
      remove(key) {
        delete this.data[key];
      },
      
      // 캐시 전체 비우기
      clear() {
        this.data = {};
        this.stopCleanupTimer();
      },
      
      // 정리 타이머 시작
      startCleanupTimer() {
        if (this.timer) return;
        
        this.timer = setInterval(() => {
          this.cleanup();
        }, this.settings.cleanupInterval);
      },
      
      // 정리 타이머 중지
      stopCleanupTimer() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      
      // 만료된 항목 정리
      cleanup() {
        const now = Date.now();
        let hasItems = false;
        
        Object.keys(this.data).forEach(key => {
          // 만료 후 10분이 지난 항목만 완전히 삭제 (stale 허용 시간)
          if (this.data[key].stale && now - this.data[key].timestamp > this.settings.expiry + 600000) {
            delete this.data[key];
          } else {
            hasItems = true;
          }
        });
        
        // 캐시가 비었으면 타이머 중지
        if (!hasItems) {
          this.stopCleanupTimer();
        }
      }
    };
    
    return caches[name];
  };
  
  // 싱글톤 인스턴스를 반환
  return {
    // 캐시 인스턴스 가져오기
    getCache(name, settings) {
      return createCache(name, settings);
    },
    
    // 캐시 기반 API 요청 함수 (stale-while-revalidate 패턴)
    async cachedFetch(cacheKey, requestFunc, cacheName = 'default', expiry = 300000) {
      const cache = this.getCache(cacheName, { expiry });
      
      // 1. 캐시된 데이터 확인 (stale 여부 관계없이)
      const cachedData = cache.get(cacheKey);
      const isStale = cache.isStale(cacheKey);
      
      // 2. 진행 중인 요청이 있는지 확인
      const hasPendingRequest = !!pendingRequests[cacheKey];
      
      // 백그라운드 재검증 함수
      const revalidate = async () => {
        // 이미 진행 중인 요청이 있으면 그 요청 결과 사용
        if (hasPendingRequest) {
          //console.log(`[요청 대기] 이미 진행 중인 요청 있음: ${cacheKey}`);
          return pendingRequests[cacheKey];
        }
        
        // 새 요청 생성
        //console.log(`[캐시 재검증] API 요청 시작: ${cacheKey}`);
        pendingRequests[cacheKey] = requestFunc().then(data => {
          //console.log(`[캐시 업데이트] 데이터 캐싱 완료: ${cacheKey}`);
          cache.set(cacheKey, data);
          delete pendingRequests[cacheKey];
          return data;
        }).catch(error => {
          //console.error(`[캐시 에러] 요청 실패: ${cacheKey}`, error);
          delete pendingRequests[cacheKey];
          throw error;
        });
        
        return pendingRequests[cacheKey];
      };
      
      // 3. 비어있거나 오래된 데이터면 즉시 API 요청 필요
      if (!cachedData) {
        //console.log(`[캐시 미스] API 요청 시작: ${cacheKey}`);
        return revalidate();
      }
      
      // 4. 최신 캐시 데이터가 있으면 반환하고 백그라운드에서 업데이트하지 않음
      if (!isStale) {
        //console.log(`[캐시 사용] 최신 캐시 데이터 사용: ${cacheKey}`);
        return cachedData;
      }
      
      // 5. 오래된 캐시 데이터는 반환하고 백그라운드에서 업데이트
      //console.log(`[캐시 사용] 오래된 캐시 데이터 사용 (업데이트 예정): ${cacheKey}`);
      
      // 비동기로 데이터 재검증 (결과를 기다리지 않음)
      revalidate().catch(() => {}); // 에러 무시
      
      // 일단 오래된 데이터 반환
      return cachedData;
    },
    
    // 데이터 변경 구독하기
    subscribe(cacheKey, callback) {
      if (!subscribers[cacheKey]) {
        subscribers[cacheKey] = [];
      }
      subscribers[cacheKey].push(callback);
      
      // 구독 취소 함수 반환
      return () => {
        subscribers[cacheKey] = subscribers[cacheKey].filter(cb => cb !== callback);
        if (subscribers[cacheKey].length === 0) {
          delete subscribers[cacheKey];
        }
      };
    },
    
    // 캐시에서 특정 항목 무효화
    invalidateCache(cacheKey, cacheName = 'default') {
      const cache = this.getCache(cacheName);
      cache.remove(cacheKey);
      //console.log(`[캐시 무효화] 항목 삭제됨: ${cacheKey}`);
    }
  };
})();

export default CacheManager; 