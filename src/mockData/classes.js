export const mockClasses = [
  {
    id: 1,
    name: '자료구조',
    year: 2024,
    semester: 1,
    professorId: 2, // professor@jbnu.ac.kr
    students: [
      {
        id: 1,
        studentId: '201911111',
        name: '김학생',
        email: 'student@jbnu.ac.kr',
        lastActive: '2024-03-15 14:30:00'
      }
    ]
  },
  {
    id: 2,
    name: '알고리즘',
    year: 2024,
    semester: 1,
    professorId: 2,
    students: [
      {
        id: 1,
        studentId: '201911111',
        name: '김학생',
        email: 'student@jbnu.ac.kr',
        lastActive: '2024-03-15 15:45:00'
      }
    ]
  }
];

export const mockMonitoringData = {
  "19": {  // userId를 key로 사용
    name: "test@jbnu.ac.kr",
    studentId: "test@jbnu.ac.kr",
    totalCodeChanges: 150,
    totalCompiles: 75,
    correctSubmissions: 25,
    submissionStats: {
      stats: [
        { name: "정답", value: 25, color: "#4CAF50" },
        { name: "오답", value: 35, color: "#f44336" },
        { name: "컴파일 에러", value: 15, color: "#ff9800" }
      ]
    },
    recentSubmissions: [
      {
        id: 1,
        problemName: "Hello World",
        submitTime: "2024-03-20 14:30",
        status: "정답",
        runtime: "0.5s",
        memory: "16MB"
      },
      {
        id: 2,
        problemName: "두 수의 합",
        submitTime: "2024-03-20 14:25",
        status: "오답",
        runtime: "0.3s",
        memory: "14MB"
      },
      {
        id: 3,
        problemName: "배열 정렬",
        submitTime: "2024-03-20 14:20",
        status: "컴파일 에러",
        runtime: "-",
        memory: "-"
      }
    ],
    timeSeriesData: [
      { timestamp: "09:00", codeChanges: 10, compiles: 5 },
      { timestamp: "10:00", codeChanges: 15, compiles: 8 },
      { timestamp: "11:00", codeChanges: 20, compiles: 12 },
      { timestamp: "12:00", codeChanges: 8, compiles: 4 },
      { timestamp: "13:00", codeChanges: 25, compiles: 15 },
      { timestamp: "14:00", codeChanges: 30, compiles: 18 }
    ]
  },
  "16": {  // 다른 학생의 데이터
    name: "jsh2256@jbnu.ac.kr",
    studentId: "jsh2256@jbnu.ac.kr",
    totalCodeChanges: 200,
    totalCompiles: 100,
    correctSubmissions: 30,
    submissionStats: {
      stats: [
        { name: "정답", value: 30, color: "#4CAF50" },
        { name: "오답", value: 40, color: "#f44336" },
        { name: "컴파일 에러", value: 20, color: "#ff9800" }
      ]
    },
    recentSubmissions: [
      {
        id: 1,
        problemName: "피보나치 수열",
        submitTime: "2024-03-20 15:30",
        status: "정답",
        runtime: "0.3s",
        memory: "14MB"
      },
      {
        id: 2,
        problemName: "DFS와 BFS",
        submitTime: "2024-03-20 15:25",
        status: "오답",
        runtime: "0.8s",
        memory: "32MB"
      },
      {
        id: 3,
        problemName: "동적 계획법",
        submitTime: "2024-03-20 15:20",
        status: "정답",
        runtime: "0.4s",
        memory: "16MB"
      }
    ],
    timeSeriesData: [
      { timestamp: "09:00", codeChanges: 15, compiles: 8 },
      { timestamp: "10:00", codeChanges: 20, compiles: 12 },
      { timestamp: "11:00", codeChanges: 25, compiles: 15 },
      { timestamp: "12:00", codeChanges: 10, compiles: 5 },
      { timestamp: "13:00", codeChanges: 30, compiles: 18 },
      { timestamp: "14:00", codeChanges: 35, compiles: 22 }
    ]
  }
}; 