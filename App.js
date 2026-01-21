import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [monitoringStatus, setMonitoringStatus] = useState('Inativo');

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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
      alert('Failed to get push token for push notification!');
      return;
    }
  }

  const scheduleNotification = async (day, hours, message) => {
    for (const hour of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "PJ Manager Scoti",
          body: message,
        },
        trigger: {
          weekday: day,
          hour: hour,
          minute: 0,
          repeats: true,
        },
      });
    }
  };

  const schedulePaymentNotifications = async (days, hours, message) => {
    for (const day of days) {
        for (const hour of hours) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "PJ Manager Scoti",
                body: message,
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
  };

  const handleActivateMonitoring = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Dia 03 (Auditoria)
    scheduleNotification(3, [8, 10, 12, 14, 16, 18, 20], "VERIFICAR NOTAS LANÇADAS 📄");

    // Dia 05 (Imposto)
    scheduleNotification(5, [8, 10, 12, 14, 16, 18, 20], "DECLARAR FATURAMENTO (PGDAS-D) 💻");

    // Dias 19 e 20 (Pagamento)
    schedulePaymentNotifications([19, 20], [8, 12, 16, 20], "PAGAR IMPOSTO (DAS) 💰");

    setMonitoringStatus('Ativo');
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>THIAGO DE MATTIA SCOTI INOVA SIMPLES (I.S.)</Text>
        <Text style={styles.subHeaderText}>CNPJ: 64.618.797/0001-78</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Monitoramento: </Text>
        <Text style={[styles.status, { color: monitoringStatus === 'Ativo' ? '#22c55e' : '#ef4444' }]}>
          {monitoringStatus}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleActivateMonitoring}>
        <Text style={styles.buttonText}>Ativar Monitoramento Fiscal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});