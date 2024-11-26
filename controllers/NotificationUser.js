const NotificationUser= require('../models/NotificationUser')

const createNotification =  async (receiverId,senderId,type,message)=>{

    try {
        const notificationData={
            sender:senderId,
            type,
            message
        };
        const userNotifications= await NotificationUser.findOne({userId:receiverId})

            if(userNotifications){

                userNotifications= new NotificationUser({
                    userId:receiverId,
                    notifications:[notificationData]
                })
            }else{
                userNotifications.notifications.push(notificationData)
            }
            const saveNotification = await userNotifications.save()
            if(saveNotification){
              console.log('Notication Created Successfully')
            }

    } catch (error) {
        console.log(error.message)
    }
}
