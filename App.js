import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, Platform, ScrollView, TextInput, Alert, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const DEFAULT_COMPANY_NAME = "THIAGO DE MATTIA SCOTI INOVA SIMPLES (I.S.)";
const DEFAULT_CNPJ = "64.618.797/0001-78";
const DEFAULT_RULES = [
  {
    id: '1',
    days: [3],
    hours: [8, 10, 12, 14, 16, 18, 20],
    message: "VERIFICAR NOTAS LANÇADAS 📄"
  },
  {
    id: '2',
    days: [5],
    hours: [8, 10, 12, 14, 16, 18, 20],
    message: "DECLARAR FATURAMENTO (PGDAS-D) 💻"
  },
  {
    id: '3',
    days: [19, 20],
    hours: [8, 12, 16, 20],
    message: "PAGAR IMPOSTO (DAS) 💰"
  }
];

export default function App() {
  const [monitoringStatus, setMonitoringStatus] = useState('Inativo');
  const [companyName, setCompanyName] = useState(DEFAULT_COMPANY_NAME);
  const [cnpj, setCnpj] = useState(DEFAULT_CNPJ);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form states
  const [daysInput, setDaysInput] = useState('');
  const [hoursInput, setHoursInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const storedName = await AsyncStorage.getItem('companyName');
      const storedCnpj = await AsyncStorage.getItem('cnpj');
      const storedRules = await AsyncStorage.getItem('rules');
      const storedStatus = await AsyncStorage.getItem('monitoringStatus');

      if (storedName) setCompanyName(storedName);
      if (storedCnpj) setCnpj(storedCnpj);
      if (storedRules) setRules(JSON.parse(storedRules));
      if (storedStatus) setMonitoringStatus(storedStatus);
    } catch (e) {
      console.error("Failed to load configuration", e);
    }
  };

  const saveConfiguration = async (newRules, newName, newCnpj) => {
    try {
      await AsyncStorage.setItem('companyName', newName);
      await AsyncStorage.setItem('cnpj', newCnpj);
      await AsyncStorage.setItem('rules', JSON.stringify(newRules));
    } catch (e) {
      console.error("Failed to save configuration", e);
    }
  };

  async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Erro', 'Falha ao obter token para notificação push!');
      return;
    }
  }

  const handleActivateMonitoring = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const rule of rules) {
        for (const day of rule.days) {
          for (const hour of rule.hours) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "PJ Manager Scoti",
                body: rule.message,
              },
              trigger: {
                day: day,
                hour: hour,
                minute: 0,
                repeats: true,
              },
            });
          }
        }
      }

      setMonitoringStatus('Ativo');
      await AsyncStorage.setItem('monitoringStatus', 'Ativo');
      Alert.alert("Sucesso", "Monitoramento ativado com as regras atuais!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao ativar monitoramento");
    }
  };

  const handleDeactivateMonitoring = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setMonitoringStatus('Inativo');
    await AsyncStorage.setItem('monitoringStatus', 'Inativo');
    Alert.alert("Sucesso", "Monitoramento desativado.");
  }

  const handleSaveSettings = async () => {
    await saveConfiguration(rules, companyName, cnpj);
    Alert.alert("Salvo", "Configurações salvas!");
    // If active, ask to reactivate to apply changes?
    if (monitoringStatus === 'Ativo') {
        Alert.alert("Atenção", "Para aplicar as novas regras, reative o monitoramento.", [
            { text: "Cancelar" },
            { text: "Reativar Agora", onPress: handleActivateMonitoring }
        ])
    }
  };

  const openAddRule = () => {
    setEditingRule(null);
    setDaysInput('');
    setHoursInput('');
    setMessageInput('');
    setModalVisible(true);
  };

  const openEditRule = (rule) => {
    setEditingRule(rule);
    setDaysInput(rule.days.join(', '));
    setHoursInput(rule.hours.join(', '));
    setMessageInput(rule.message);
    setModalVisible(true);
  };

  const saveRule = () => {
    // Validate inputs
    const days = daysInput.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n) && n > 0 && n <= 31);
    const hours = hoursInput.split(',').map(h => parseInt(h.trim())).filter(n => !isNaN(n) && n >= 0 && n < 24);

    if (days.length === 0 || hours.length === 0 || !messageInput) {
      Alert.alert("Erro", "Preencha dias (1-31), horas (0-23) e mensagem corretamente.");
      return;
    }

    const newRule = {
      id: editingRule ? editingRule.id : Date.now().toString(),
      days,
      hours,
      message: messageInput
    };

    let newRules;
    if (editingRule) {
      newRules = rules.map(r => r.id === editingRule.id ? newRule : r);
    } else {
      newRules = [...rules, newRule];
    }
    setRules(newRules);
    setModalVisible(false);
  };

  const deleteRule = (id) => {
    const newRules = rules.filter(r => r.id !== id);
    setRules(newRules);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TextInput
          style={styles.headerInput}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Nome da Empresa"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.subHeaderInput}
          value={cnpj}
          onChangeText={setCnpj}
          placeholder="CNPJ"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Monitoramento: </Text>
        <Text style={[styles.status, { color: monitoringStatus === 'Ativo' ? '#22c55e' : '#ef4444' }]}>
          {monitoringStatus}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
         <TouchableOpacity style={[styles.actionButton, {backgroundColor: monitoringStatus === 'Ativo' ? '#ef4444' : '#22c55e'}]} onPress={monitoringStatus === 'Ativo' ? handleDeactivateMonitoring : handleActivateMonitoring}>
            <Text style={styles.buttonText}>{monitoringStatus === 'Ativo' ? 'Desativar' : 'Ativar'} Monitoramento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <Text style={styles.buttonText}>Salvar Dados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rulesHeader}>
          <Text style={styles.rulesTitle}>Regras de Notificação</Text>
          <TouchableOpacity style={styles.addRuleButton} onPress={openAddRule}>
              <Text style={styles.addRuleButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
      </View>

      <ScrollView style={styles.rulesList}>
        {rules.map((rule) => (
          <View key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleInfo}>
                <Text style={styles.ruleText}><Text style={styles.bold}>Dias:</Text> {rule.days.join(', ')}</Text>
                <Text style={styles.ruleText}><Text style={styles.bold}>Horas:</Text> {rule.hours.join(', ')}h</Text>
                <Text style={styles.ruleText}><Text style={styles.bold}>Msg:</Text> {rule.message}</Text>
            </View>
            <View style={styles.ruleActions}>
                <TouchableOpacity onPress={() => openEditRule(rule)} style={styles.iconButton}>
                    <Text style={styles.iconButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteRule(rule.id)} style={styles.iconButton}>
                    <Text style={styles.iconButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editingRule ? "Editar Regra" : "Nova Regra"}</Text>

            <Text style={styles.label}>Dias do mês (separados por vírgula):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3, 5, 20"
              placeholderTextColor="#999"
              value={daysInput}
              onChangeText={setDaysInput}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Horas (0-23, separadas por vírgula):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 8, 12, 18"
              placeholderTextColor="#999"
              value={hoursInput}
              onChangeText={setHoursInput}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Mensagem:</Text>
            <TextInput
              style={styles.input}
              placeholder="Mensagem da notificação"
              placeholderTextColor="#999"
              value={messageInput}
              onChangeText={setMessageInput}
            />

            <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveModalButton]} onPress={saveRule}>
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerInput: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    width: '100%',
    marginBottom: 10,
  },
  subHeaderInput: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    minWidth: 200,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  rulesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 10,
  },
  rulesTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  addRuleButton: {
      backgroundColor: '#333',
      padding: 8,
      borderRadius: 5,
  },
  addRuleButtonText: {
      color: '#fff',
      fontSize: 14,
  },
  rulesList: {
      flex: 1,
      paddingHorizontal: 20,
  },
  ruleCard: {
      backgroundColor: '#1E1E1E',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  ruleInfo: {
      flex: 1,
  },
  ruleText: {
      color: '#ccc',
      marginBottom: 2,
  },
  bold: {
      fontWeight: 'bold',
      color: '#fff',
  },
  ruleActions: {
      flexDirection: 'row',
  },
  iconButton: {
      marginLeft: 10,
      padding: 5,
  },
  iconButtonText: {
      fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 35,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20,
      textAlign: 'center',
  },
  label: {
      color: '#ccc',
      marginBottom: 5,
  },
  input: {
      backgroundColor: '#333',
      color: '#fff',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
  },
  button: {
      padding: 10,
      borderRadius: 5,
      width: '45%',
      alignItems: 'center',
  },
  cancelButton: {
      backgroundColor: '#555',
  },
  saveModalButton: {
      backgroundColor: '#4F46E5',
  }
});
