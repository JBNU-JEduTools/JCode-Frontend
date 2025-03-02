import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Link,
  Fade,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Modal,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import jbnuLogo from '../../assets/jbnulogopng.png';
import swunivLogo from '../../assets/swunivlogopng.png';
import jedutoolsLogo from '../../assets/jedutoolslogopng.png';
import litmusLogo from '../../assets/Litmuslogosvg.svg';
import jcloudLogo from '../../assets/jcloudlogosvg.svg';
import { keyframes } from '@mui/system';
import CIcon from '../../assets/icons/cprogramming.svg';
import PythonIcon from '../../assets/icons/python.svg';
import CppIcon from '../../assets/icons/c++.svg';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scroll = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-300px * 5)); }
  `;

  const partners = [
    { name: <img src={jcloudLogo} alt="JCloud" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://jcloud.jbnu.ac.kr' },
    { name: <img src={litmusLogo} alt="Litmus" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://litmus.jbnu.ac.kr' },
    { name: <img src={swunivLogo} alt="SW중심대학" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://swuniv.jbnu.ac.kr' },
    { name: <img src={jbnuLogo} alt="JBNU" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://www.jbnu.ac.kr' },
    { name: <img src={jedutoolsLogo} alt="JEduTools Portal" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://jedutools.jbnu.ac.kr' },
  ];

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: "Web IDE",
      description: "브라우저에서 바로 사용하는\n강력한 개발 환경"
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: "Kubernetes",
      description: "안정적이고 확장 가능한\n쿠버네티스 기반 서비스"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Watcher",
      description: "실시간 활동 분석 및\n보안 감시 시스템"
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "JEduTools",
      description: "재학생들이 직접 개발하는\nSW교육을 위한 학습 플랫폼"
    }
  ];

  const visionMission = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 40 }} />,
      title: "Mission",
      description: "모든 학생에게 접근성 높은 개발 환경을 제공하고,\n투명하고 공정한 코딩 문화를 만들어 나가는 것입니다."
    },
    {
      icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
      title: "Vision",
      description: "학생들이 스스로 개발에 참여하고,\n실제 사용 경험을 바탕으로 자연스러운 혁신의 선순환을 이루어,\n모든 학습자에게 유익하고 활발한 교육 환경을\n제공하는 플랫폼으로 성장하는 것이 목표입니다."
    }
  ];

  const programmingLanguages = [
    { name: 'Python', icon: <img src={PythonIcon} alt="Python" style={{ width: '40px', height: '40px' }} />, description: '웹 개발\n데이터 분석 및 시각화\n머신러닝, 인공지능 및 과학 컴퓨팅'},
    { name: 'C', icon: <img src={CIcon} alt="C" style={{ width: '40px', height: '40px' }} />, description: '운영체제\n임베디드 시스템' },
    { name: 'C++', icon: <img src={CppIcon} alt="C++" style={{ width: '40px', height: '40px' }} />, description: '게임 개발 및 그래픽 프로그래밍\n데스크탑 애플리케이션 및 실시간 시스템' }
  ];

  const teamMembers = [
    {
      name: '박현찬',
      role: 'Professor',
    },
    {
      name: '김은혜',
      role: 'Student',
    },
    {
      name: '김진석',
      role: 'Student',
    },
    {
      name: '진순헌',
      role: 'Student',
    },
    {
      name: '허완',
      role: 'Student',
    }
  ];

  const timeline = [
    {
      date: '2020년 3월',
      title: 'JCode 출시',
      description: '웹 IDE 플랫폼 출시'
    },
    {
      date: '2020년 3월',
      title: 'Watcher 출시',
      description: '독립적인 Watcher 서비스 출시'
    },
    {
      date: '2024년 12월',
      title: 'JCode 통합 사이트 개발',
      description: '오픈소스, 기존의 watcher 서비스 통합 사이트 개발'
    },
    {
      date: '2025년 2월',
      title: '쿠버네티스 도입',
      description: '쿠버네티스를 통한 안정적인 서비스 운영'
    },
    {
      date: '2025년 3월',
      title: 'JCode 통합 사이트 출시',
      description: 'JCode + Watcher 통합 웹사이트 출시'
    }
  ];

  const guides = [
    {
      title: '시작하기',
      description: '계정 생성부터 프로젝트 생성까지',
      link: '/docs/getting-started'
    },
    {
      title: '개발 환경 설정',
      description: '언어별 개발 환경 설정 가이드',
      link: '/docs/environment-setup'
    },
    {
      title: 'Watcher 사용법',
      description: '통계 확인 및 일일 활동 분석',
      link: '/docs/collaboration'
    },
    {
      title: '수업 참가 방법',
      description: '수업을 위한 랜덤 코드 생성',
      link: '/docs/troubleshooting'
    }
  ];

  const SectionTitle = ({ children, smaller }) => (
    <Typography 
      variant="h4" 
      align="center"
      sx={{ 
        fontWeight: theme.typography.fontWeightBold,
        fontFamily: theme.typography.fontFamily,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`
          : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 6,
        fontSize: smaller ? '1.8rem' : undefined
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ pt: 8 }}>
          {/* 로고 섹션 */}
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main
                    : theme.palette.primary.dark,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: theme.typography.fontWeightBold,
                  letterSpacing: 1,
                  mb: 2
                }}
              >
                JCode
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: theme.typography.fontWeightMedium
                }}
              >
                클라우드 기반 웹 IDE 플랫폼
              </Typography>
            </motion.div>
          </Box>

          {/* 서비스 소개 섹션 */}
          <Box sx={{ mb: 12, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                  fontSize: '1.2rem', 
                  lineHeight: 1.8,
                  maxWidth: '800px',
                  margin: '0 auto',
                  mb: 4
                }}
              >
                JCode는 웹 기반 IDE와 통계 및 모니터링 기능을 제공하는 서비스입니다.
                <br />
                사용자는 별도의 설치 없이 웹 브라우저를 통해 언제 어디서나 접근할 수 있으며,
                <br /> 
                클라우드에서 최신 개발 환경을 손쉽게 이용할 수 있습니다.
              </Typography>
            </motion.div>
          </Box>

          {/* 주요 기능 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Features</SectionTitle>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <Box sx={{ 
                          color: theme.palette.mode === 'dark' 
                            ? '#FF79C6'
                            : theme.palette.primary.main,
                          mb: 2 
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: theme.typography.fontWeightBold,
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                        }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 사용 가이드 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Guide</SectionTitle>
            <Grid container spacing={3}>
              {guides.map((guide, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={guide.link}
                      underline="none"
                      sx={{ display: 'block' }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          background: theme.palette.mode === 'dark' 
                            ? theme.palette.background.paper
                            : theme.palette.background.default,
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.3s ease',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ArticleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {guide.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {guide.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 프로그래밍 언어 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Programming Languages</SectionTitle>
            <Grid container spacing={3}>
              {programmingLanguages.map((lang, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '160px',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h2" sx={{ mr: 1, fontSize: '2rem' }}>
                              {lang.icon}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {lang.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-line'
                          }}>
                            {lang.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: '0.9rem'
                }}
              >
                * 지속적인 업데이트를 통해 더 많은 프로그래밍 언어를 지원할 예정입니다.
              </Typography>
            </Box>
          </Box>

          {/* 미션 및 비전 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Goal</SectionTitle>
            <Grid container spacing={4}>
              {visionMission.map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: 250,
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Box>
                          <Box sx={{ 
                            color: theme.palette.mode === 'dark' 
                              ? '#FF79C6'
                              : theme.palette.primary.main,
                            mb: 1
                          }}>
                            {item.icon}
                          </Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: theme.typography.fontWeightBold,
                            color: theme.palette.text.primary,
                            fontFamily: theme.typography.fontFamily,
                            mb: 1
                          }}>
                            {item.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}>
                          {item.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 팀 소개 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Development Team</SectionTitle>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      width: { xs: '100%', sm: '300px' },
                      margin: '0 auto',
                      background: theme.palette.mode === 'dark' 
                        ? theme.palette.background.paper
                        : theme.palette.background.default,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4],
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          margin: '0 auto',
                          mb: 2,
                          border: `2px solid ${theme.palette.primary.main}`
                        }}
                      />
                      <Typography variant="h6" gutterBottom>
                        박현찬
                      </Typography>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Professor
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              {teamMembers.slice(1).map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto',
                            mb: 2,
                            border: `2px solid ${theme.palette.primary.main}`
                          }}
                        />
                        <Typography variant="h6" gutterBottom>
                          {member.name}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {member.role}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <EmailIcon sx={{ color: theme.palette.primary.main }} /><Link href="https://mail.google.com/mail/?view=cm&fs=1&to=jedutools@gmail.com" target="_blank" rel="noopener noreferrer" sx={{ 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}>jedutools@gmail.com</Link>
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mt: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <LocationOnIcon /> 전북대학교 공과대학 7호관 619호 OSLAB
              </Typography>
            </Box>
          </Box>

          {/* 타임라인 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Project History</SectionTitle>
            <Box sx={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : index % 2 === 0 ? 'row' : 'row-reverse',
                      mb: 4,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: isMobile ? '20px' : '50%',
                        top: isMobile ? '40px' : 0,
                        bottom: '-20px',
                        width: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transform: isMobile ? 'none' : 'translateX(-50%)',
                        display: index === timeline.length - 1 ? 'none' : 'block'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? '100%' : '50%',
                        pr: isMobile ? 0 : index % 2 === 0 ? 4 : 0,
                        pl: isMobile ? 0 : index % 2 === 0 ? 0 : 4,
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          position: 'absolute',
                          top: '20px',
                          left: isMobile ? '11px' : index % 2 === 0 ? 'auto' : '-10px',
                          right: isMobile ? 'auto' : index % 2 === 0 ? '-10px' : 'auto',
                          zIndex: 1
                        }}
                      />
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          ml: isMobile ? 5 : 0,
                          background: theme.palette.mode === 'dark' 
                            ? theme.palette.background.paper
                            : theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          {item.date}
                        </Typography>
                        <Typography variant="h6" sx={{ my: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Related Sites 섹션 */}
          <Box sx={{ 
            position: 'relative',
            width: '100vw',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            background: theme.palette.mode === 'dark' 
              ? theme.palette.background.default
              : theme.palette.background.paper,
            py: 6,
            overflow: 'hidden'
          }}>
            <Container maxWidth="lg" sx={{ mb: 3 }}>
              <SectionTitle smaller>Family Sites</SectionTitle>
            </Container>
            
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              <Box sx={{
                display: 'flex',
                width: 'max-content',
                animation: `${scroll} 40s linear infinite`,
                '&:hover': {
                  animationPlayState: 'paused'
                },
                gap: '30px'
              }}>
                {[...partners, ...partners].map((partner, index) => (
                  <Link
                    key={index}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '15px',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.background.paper
                        : theme.palette.background.default,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    {partner.name}
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default AboutPage; 