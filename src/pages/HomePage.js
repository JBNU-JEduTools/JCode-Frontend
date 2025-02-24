import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  useTheme,
  Fade,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@mui/system';
import litmusLogo from '../assets/Litmuslogosvg.svg';
import jcloudLogo from '../assets/jcloudlogosvg.svg';
//import csaiLogo from '../assets/csailogosvg.svg';
import swunivLogo from '../assets/swunivlogopng.png';
import jbnuLogo from '../assets/jbnulogopng.png';
import jedutoolsLogo from '../assets/jedutoolslogopng.png';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }}/>,
      title: "실시간 코딩 환경",
      description: `웹 기반의 통합 개발 환경(IDE)으로 언제 어디서나 코딩이 가능합니다. 
      별도의 프로그램 설치 없이 브라우저만으로 코딩을 시작할 수 있으며, 
      자동 저장 기능으로 작업 내용이 안전하게 보관됩니다. 
      다양한 프로그래밍 언어를 지원하며, 실시간 컴파일과 실행 결과를 즉시 확인할 수 있습니다.`
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }}/>,
      title: "부정행위 방지",
      description: `AI 기반의 모니터링 시스템으로 공정한 학습 환경을 제공합니다. 
      실시간 코드 유사도 검사를 통해 표절을 방지하고, 
      학습자의 코딩 패턴을 분석하여 비정상적인 활동을 감지합니다. 
      또한, 시험 모드에서는 화면 전환 감지와 같은 보안 기능으로 
      신뢰할 수 있는 평가 환경을 구축합니다.`
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }}/>,
      title: "효율적인 학습 관리",
      description: `실시간 피드백과 진도 관리로 효과적인 프로그래밍 교육이 가능합니다. 
      교수자는 학습자의 코딩 과정을 실시간으로 모니터링하고 즉각적인 피드백을 제공할 수 있습니다. 
      자동 채점 시스템으로 과제 평가의 효율성을 높이고, 
      상세한 학습 분석 데이터를 통해 개인별 맞춤형 교육을 실현합니다.`
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }}/>,
      title: "협업 중심 교육",
      description: `교수자와 학습자 간의 원활한 소통으로 더 나은 학습 경험을 제공합니다. 
      실시간 코드 리뷰와 피드백 시스템으로 즉각적인 상호작용이 가능하며, 
      학습자들은 동료들의 코드를 참고하며 다양한 문제 해결 방법을 학습할 수 있습니다. 
      토론 기능을 통해 프로그래밍 지식을 공유하고 함께 성장하는 환경을 조성합니다.`
    }
  ];

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/webide');
    } else {
      navigate('/login');
    }
  };

  // 무한 스크롤 애니메이션 정의
  const scroll = keyframes`
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }  // 더 자연스러운 연결을 위해 -50%로 조정
  `;

  const partners = [
    { name: <img 
        src={jcloudLogo}
        alt="JCloud" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://jcloud.jbnu.ac.kr' 
    },
    { name: <img 
        //src={csaiLogo}
        alt="JBNU CSAI" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://csai.jbnu.ac.kr' 
    },
    { name: <img 
        src={litmusLogo}
        alt="Litmus" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://litmus.jbnu.ac.kr' 
    },
    { name: <img 
        src={swunivLogo}
        alt="SW중심대학" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://swuniv.jbnu.ac.kr' 
    },
    { name: <img 
        src={jbnuLogo}
        alt="JBNU" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://www.jbnu.ac.kr' 
    },
    { name: <img 
        src={jedutoolsLogo}
        alt="JEduTools Portal" 
        style={{ 
          height: '50px',
          width: '300px',
          verticalAlign: 'middle',
          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
          margin: '0',
          objectFit: 'contain'
        }}
    />, 
      url: 'https://jedutools.jbnu.ac.kr' 
    },
  ];

  return (
    <Fade in={true} timeout={300}>
      <Box>
        {/* Hero Section */}
        <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
          {/* 배경 이미지 애니메이션 */}
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 8,
              ease: "easeOut" 
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/jbnu_2.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0
            }}
          />

          {/* 고정된 컨텐츠 */}
          <Box 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
            }}
          >
            <Container maxWidth="lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    mb: 4
                  }}
                >
                  JCode
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    maxWidth: '800px',
                    lineHeight: 1.6,
                    
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                  }}
                >
                  프로그래밍 교육의 새로운 패러다임을 제시합니다.
                  <br />
                  더 나은 코딩 교육을 위한 혁신적인 솔루션을 경험하세요.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<SchoolIcon />}
                  onClick={handleStart}
                  sx={{ 
                    backgroundColor: '#004C9C',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#003870'
                    }
                  }}
                >
                  학습 시작하기
                </Button>
              </motion.div>
            </Container>
          </Box>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                mb: 4,
                mt: 10,
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              주요 기능
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        height: '100%',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)' 
                          : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                          fontWeight: 'bold'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>

        {/* Vision Section */}
        <Box 
          sx={{ 
            py: 10, 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h3" 
                align="center" 
                gutterBottom
                sx={{ 
                  mb: 4,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              >
                함께 만드는 SW 교육 혁신
              </Typography>
              <Typography 
                variant="h6" 
                align="center"
                sx={{ 
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.8,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  color: 'text.secondary',
                  mb: 6
                }}
              >
                JEduTools는 단순한 학습 도구가 아닌, 
                전북대학교 학생들이 직접 참여하여 만들어가는 살아있는 프로젝트입니다.
                우리는 SW 교육의 미래를 함께 그려나갑니다.
              </Typography>

              <Grid container spacing={4} sx={{ mb: 8 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
                      100+
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      학생 개발자
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      매년 새로운 학생 개발자들이 참여하여
                      프로젝트를 발전시키고 있습니다
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
                      1,000+
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      활성 사용자
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      전북대학교 학생들이 매일 사용하는
                      필수 학습 플랫폼입니다
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
                      50+
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      강의 운영
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      다양한 프로그래밍 강의에서
                      실제 교육 도구로 활용되고 있습니다
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={6} sx={{ mt: 4 }}>
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8 }}
                  >
                    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                      실전적인 개발 경험
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.8 }}>
                      JEduTools는 실제 사용되는 서비스를 개발하고 운영하는 경험을 제공합니다.
                      학생들은 실제 사용자의 피드백을 받으며 서비스를 개선하고,
                      대규모 시스템 운영에 필요한 실무 기술을 습득합니다.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      코드 리뷰, CI/CD, 테스트 자동화 등 현업에서 사용하는
                      개발 프로세스를 직접 경험하며 성장합니다.
                    </Typography>
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8 }}
                  >
                    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                      오픈소스 문화
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.8 }}>
                      우리는 모든 코드를 오픈소스로 공개하고, 
                      누구나 프로젝트 개선에 참여할 수 있는 환경을 만듭니다.
                      학생들은 오픈소스 프로젝트 기여 경험을 쌓으며,
                      협업과 코드 품질의 중요성을 배웁니다.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      더 나은 교육 환경을 위해 서로의 지식을 공유하고,
                      함께 성장하는 개발 문화를 만들어갑니다.
                    </Typography>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* Join Section */}
        <Box 
          sx={{ 
            py: 10,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
              : 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
            color: '#fff'
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h3" 
                align="center" 
                gutterBottom
                sx={{ 
                  mb: 4,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              >
                함께 만들어가요
              </Typography>
              <Typography 
                variant="h6" 
                align="center"
                sx={{ 
                  maxWidth: '800px',
                  mx: 'auto',
                  mb: 6,
                  lineHeight: 1.8,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              >
                더 나은 SW 교육을 위한 여정에 함께하세요.
                <br />
                여러분의 아이디어와 열정이 교육의 혁신을 만듭니다.
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<SchoolIcon />}
                  onClick={handleStart}
                  sx={{ 
                    backgroundColor: '#004C9C',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#003870'
                    }
                  }}
                >
                  학습 시작하기
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Partners Section */}
        <Box 
          sx={{ 
            py: 6,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.3)' 
              : 'rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h6" 
              align="center"
              sx={{ 
                mb: 4,
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                color: 'text.secondary'
              }}
            >
              Partners
            </Typography>
          </Container>
          <Box 
            sx={{ 
              display: 'flex',
              width: 'fit-content',
              animation: `${scroll} 120s linear infinite`,
              '&:hover': {
                animationPlayState: 'paused'
              },
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%)',
              marginLeft: '0',
              marginRight: '0',
              gap: '100px'
            }}
          >
            {[...partners, ...partners, ...partners, ...partners, ...partners, ...partners].map((partner, index) => (
              <Box
                key={index}
                component="a"
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(0, 0, 0, 0.01)',
                  borderRadius: 1,
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  color: 'text.primary',
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    fontWeight: 'bold'
                  }}
                >
                  {partner.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default HomePage; 