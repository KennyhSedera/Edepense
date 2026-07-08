import { Button, Text, View } from 'react-native'
import React, { } from 'react'
import { sendNotification } from '@/services/notificationService';
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';

export default function NotificationScreen() {

  const handleSendNotification = async () => {
    await sendNotification({
      title: '💰 Rappel de dépenses',
      body: "N'oubliez pas de saisir vos dépenses du jour !",
      route: "/(detail)/detail-shopping",
      params: { id: "1783020811925" },
    });
  };

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Notification" />}
    >
      <Text>notification</Text>
      <Button title='Send' onPress={handleSendNotification} />
    </MainHeader>
  )
}
