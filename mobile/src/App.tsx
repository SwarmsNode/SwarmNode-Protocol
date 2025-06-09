import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';

// Configuration du thème
const SwarmNodeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E84142',
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    border: '#404040',
    notification: '#E84142',
  },
};

// Types TypeScript
interface Agent {
  id: number;
  name: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  performance: number;
  earnings: string;
  tasksCompleted: number;
  uptime: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: number;
}

interface WalletInfo {
  address: string;
  balance: string;
  pendingRewards: string;
}

// Services API
class SwarmNodeAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = __DEV__ 
      ? 'http://localhost:3001/api/v1'
      : 'https://api.swarmnode.ai/v1';
  }

  async initialize() {
    this.apiKey = await AsyncStorage.getItem('api_key');
  }

  async getAgents(): Promise<Agent[]> {
    // Simulation de données pour le développement
    return [
      {
        id: 1,
        name: 'DeFi Trader',
        status: 'active',
        performance: 95.2,
        earnings: '1,247.50',
        tasksCompleted: 156,
        uptime: '99.8%'
      },
      {
        id: 2,
        name: 'Data Analyzer',
        status: 'busy',
        performance: 87.3,
        earnings: '834.20',
        tasksCompleted: 98,
        uptime: '98.1%'
      },
      {
        id: 3,
        name: 'Network Monitor',
        status: 'idle',
        performance: 91.7,
        earnings: '456.80',
        tasksCompleted: 67,
        uptime: '99.9%'
      }
    ];
  }

  async getTasks(): Promise<Task[]> {
    return [
      {
        id: 1,
        title: 'Arbitrage Analysis',
        description: 'Analyze DEX price differences for profitable trades',
        reward: '25.00 SWARM',
        deadline: new Date(Date.now() + 3600000),
        status: 'pending'
      },
      {
        id: 2,
        title: 'Market Data Processing',
        description: 'Process and validate market data feeds',
        reward: '15.50 SWARM',
        deadline: new Date(Date.now() + 7200000),
        status: 'in_progress',
        assignedAgent: 2
      }
    ];
  }

  async getWalletInfo(): Promise<WalletInfo> {
    return {
      address: '0x742d35Cc6A3...D9e64C',
      balance: '12,847.50',
      pendingRewards: '345.20'
    };
  }

  async getPerformanceData() {
    // Données simulées pour le graphique
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [{
        data: [120, 145, 165, 180, 195, 220],
        color: (opacity = 1) => `rgba(232, 65, 66, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }
}

const api = new SwarmNodeAPI();

// Composant de carte d'agent
const AgentCard: React.FC<{ agent: Agent; onPress: () => void }> = ({ agent, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'idle': return '#2196F3';
      case 'offline': return '#F44336';
      default: return '#666666';
    }
  };

  return (
    <TouchableOpacity style={styles.agentCard} onPress={onPress}>
      <View style={styles.agentHeader}>
        <View>
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(agent.status) }]} />
            <Text style={styles.statusText}>{agent.status.toUpperCase()}</Text>
          </View>
        </View>
        <Icon name="robot" size={32} color="#E84142" />
      </View>
      
      <View style={styles.agentStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{agent.performance}%</Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{agent.earnings}</Text>
          <Text style={styles.statLabel}>SWARM</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{agent.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tâches</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Écran Dashboard
const DashboardScreen: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [wallet, performance] = await Promise.all([
        api.getWalletInfo(),
        api.getPerformanceData()
      ]);
      setWalletInfo(wallet);
      setPerformanceData(performance);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#E84142', '#d63535']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>SwarmNode Protocol</Text>
          <Text style={styles.headerSubtitle}>Tableau de Bord</Text>
        </LinearGradient>

        {/* Informations du portefeuille */}
        {walletInfo && (
          <View style={styles.walletSection}>
            <Text style={styles.sectionTitle}>Mon Portefeuille</Text>
            <View style={styles.walletCard}>
              <View style={styles.walletItem}>
                <Text style={styles.walletLabel}>Solde SWARM</Text>
                <Text style={styles.walletValue}>{walletInfo.balance}</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={styles.walletLabel}>Récompenses en attente</Text>
                <Text style={styles.walletValue}>{walletInfo.pendingRewards}</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={styles.walletLabel}>Adresse</Text>
                <Text style={styles.walletAddress}>{walletInfo.address}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Graphique de performance */}
        {performanceData && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Performance (6 mois)</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={performanceData}
                width={350}
                height={200}
                chartConfig={{
                  backgroundColor: '#2d2d2d',
                  backgroundGradientFrom: '#2d2d2d',
                  backgroundGradientTo: '#2d2d2d',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(232, 65, 66, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#E84142'
                  }
                }}
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="add-circle" size={32} color="#E84142" />
              <Text style={styles.actionText}>Deploy Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="assignment" size={32} color="#E84142" />
              <Text style={styles.actionText}>Create Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="account-balance-wallet" size={32} color="#E84142" />
              <Text style={styles.actionText}>Claim Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="settings" size={32} color="#E84142" />
              <Text style={styles.actionText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Écran Agents
const AgentsScreen: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentsData = await api.getAgents();
      setAgents(agentsData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les agents');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
  };

  const handleAgentPress = (agent: Agent) => {
    Alert.alert(
      agent.name,
      `Performance: ${agent.performance}%\nGains: ${agent.earnings} SWARM\nTâches: ${agent.tasksCompleted}\nUptime: ${agent.uptime}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Mes Agents</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onPress={() => handleAgentPress(agent)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Écran Tâches
const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les tâches');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#666666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Tâches</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[styles.taskStatus, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.taskStatusText}>{task.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.taskDescription}>{task.description}</Text>
            <View style={styles.taskFooter}>
              <Text style={styles.taskReward}>{task.reward}</Text>
              <Text style={styles.taskDeadline}>
                Échéance: {task.deadline.toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Navigation
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  useEffect(() => {
    api.initialize();
  }, []);

  return (
    <NavigationContainer theme={SwarmNodeTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'Agents') {
              iconName = 'smart-toy';
            } else if (route.name === 'Tasks') {
              iconName = 'assignment';
            } else {
              iconName = 'more-horiz';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#E84142',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: '#2d2d2d',
            borderTopColor: '#404040',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarLabel: 'Tableau de Bord' }}
        />
        <Tab.Screen 
          name="Agents" 
          component={AgentsScreen}
          options={{ tabBarLabel: 'Agents' }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TasksScreen}
          options={{ tabBarLabel: 'Tâches' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#E84142',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  walletSection: {
    padding: 20,
  },
  walletCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletLabel: {
    fontSize: 14,
    color: '#cccccc',
  },
  walletValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E84142',
  },
  walletAddress: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  chartSection: {
    padding: 20,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 10,
  },
  chart: {
    borderRadius: 10,
  },
  actionsSection: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  actionText: {
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  agentCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#cccccc',
  },
  agentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E84142',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 2,
  },
  taskCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 15,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E84142',
  },
  taskDeadline: {
    fontSize: 12,
    color: '#cccccc',
  },
});

export default App;
