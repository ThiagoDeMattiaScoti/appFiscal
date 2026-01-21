# 🏗️ BLUEPRINT DE CONSTRUÇÃO: APP "PJ MANAGER SCOTI"

Você é um Engenheiro de Software Sênior especializado em Mobile (React Native + Expo). 
Sua tarefa é gerar o código completo para o aplicativo de gestão fiscal da empresa **THIAGO DE MATTIA SCOTI INOVA SIMPLES (I.S.)**.

## 📱 ESCOPO DO APP
O app deve ser um utilitário de agendamento de notificações locais persistentes para evitar multas fiscais.

## 🛠️ STACK TÉCNICA
- **Framework:** React Native com Expo (SDK atualizado).
- **Biblioteca de Notificações:** `expo-notifications`.
- **Estilização:** Dark Mode (Background: #121212, Primary: #4F46E5).

## 📅 LÓGICA DE AGENDAMENTO (NOTIFICAÇÕES LOCAIS)
O app deve agendar triggers recorrentes (`repeats: true`) para os seguintes gatilhos:

1. **Dia 03 (Auditoria):** - Mensagem: "VERIFICAR NOTAS LANÇADAS 📄"
   - Horários: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00.
2. **Dia 05 (Imposto):** - Mensagem: "DECLARAR FATURAMENTO (PGDAS-D) 💻"
   - Horários: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00.
3. **Dias 19 e 20 (Pagamento):** - Mensagem: "PAGAR IMPOSTO (DAS) 💰"
   - Horários: 08:00, 12:00, 16:00, 20:00.

## 🧱 REQUISITOS DE CÓDIGO (App.js)
1. **Permissões:** Solicitar permissão de notificação logo no `useEffect` de montagem.
2. **Persistência:** Criar um botão "Ativar Monitoramento Fiscal" que:
   - Cancela agendamentos anteriores para evitar duplicidade.
   - Itera sobre os arrays de dias/horas e agenda os novos `Notifications.scheduleNotificationAsync`.
3. **Interface (UI):**
   - Header com o nome da empresa e o CNPJ: 64.618.797/0001-78.
   - Status de "Monitoramento Ativo/Inativo".
   - Botão de estilo moderno (botão com bordas arredondadas e feedback visual).

## 📝 OUTPUT ESPERADO
- O código completo do arquivo `App.js`.
- O comando de instalação das dependências necessárias via terminal.