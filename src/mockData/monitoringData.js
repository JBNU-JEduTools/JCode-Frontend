// 전체 학생들의 코드 변화량 데이터
export const mockStudentCodeStats = [
  { studentId: "201911111", studentName: "김학생", totalChanges: 150, avgChangesPerMin: 2.1 },
  { studentId: "201922222", studentName: "이학생", totalChanges: 320, avgChangesPerMin: 4.5 },
  { studentId: "201933333", studentName: "박학생", totalChanges: 180, avgChangesPerMin: 2.5 },
  { studentId: "201944444", studentName: "최학생", totalChanges: 890, avgChangesPerMin: 12.4 }, // 특이점
  { studentId: "201955555", studentName: "정학생", totalChanges: 220, avgChangesPerMin: 3.1 },
  { studentId: "201966666", studentName: "한학생", totalChanges: 195, avgChangesPerMin: 2.7 },
  { studentId: "201977777", studentName: "임학생", totalChanges: 760, avgChangesPerMin: 10.6 }, // 특이점
];

// 컴파일러별 사용 통계
export const mockCompileStats = [
  { name: 'GCC', count: 156 },
  { name: 'Python', count: 234 },
  { name: 'Java', count: 89 },
  { name: 'C++', count: 123 }
];

// 제출 결과 통계
export const mockSubmissionStats = [
  { name: '정답', value: 45, color: '#4caf50' },
  { name: '컴파일 에러', value: 15, color: '#f44336' },
  { name: '런타임 에러', value: 12, color: '#ff9800' },
  { name: '시간 초과', value: 8, color: '#2196f3' },
  { name: '메모리 초과', value: 5, color: '#9c27b0' }
]; 