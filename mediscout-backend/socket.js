import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // السماح لجميع النطاقات بالاتصال بالسوكيت
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // انضمام المستخدم لغرفه الخاصة بدوره والمعرّف الخاص به
    socket.on('join_room', (data) => {
      if (!data) return;
      const { userId, role } = data;

      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 Socket ${socket.id} joined room: user_${userId}`);

        if (role === 'pharmacist') {
          socket.join(`pharmacist_${userId}`);
          socket.join('role_pharmacist');
          console.log(`👨‍⚕️ Socket ${socket.id} joined room: pharmacist_${userId}`);
        } else if (role === 'delivery') {
          socket.join(`delivery_${userId}`);
          socket.join('role_delivery');
          console.log(`🚚 Socket ${socket.id} joined room: delivery_${userId}`);
        }
      }

      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

// إرسال تنبيه للصيدلي الموجه له الطلب
export const notifyPharmacistNewPrescription = (pharmacistId, prescription) => {
  if (!io) return;
  const targetPharmacistId = pharmacistId ? pharmacistId.toString() : undefined;
  const eventData = {
    type: 'NEW_PRESCRIPTION_SUBMITTED',
    pharmacistId: targetPharmacistId,
    prescription,
  };

  if (targetPharmacistId) {
    io.to(`pharmacist_${targetPharmacistId}`).emit('prescription:new', eventData);
    io.to(`user_${targetPharmacistId}`).emit('prescription:new', eventData);
  }
  io.to('role_pharmacist').emit('prescription:new', eventData);
  // بث عام للتأكد من وصول التنبيه لكافة شاشات الصيدلي المتصلة
  io.emit('prescription:new', eventData);
};

// إرسال تنبيه للمريض بتحديث حالة الروشتة (مثل اعتمادها من الصيدلي)
export const notifyPatientPrescriptionStatus = (userId, prescription) => {
  if (!io) return;
  const targetUserId = userId ? userId.toString() : undefined;
  const eventData = {
    type: 'PRESCRIPTION_STATUS_UPDATED',
    userId: targetUserId,
    prescription,
  };

  if (targetUserId) {
    io.to(`user_${targetUserId}`).emit('prescription:status_updated', eventData);
  }
  // بث الأحداث المفتوحة
  io.emit('prescription:status_updated', eventData);
};

// إرسال تنبيه لمندوب التوصيل بطلب جديد أو تحديث حالة الشحنة
export const notifyDeliveryNewOrder = (deliveryId, prescription) => {
  if (!io) return;
  const targetDeliveryId = deliveryId ? deliveryId.toString() : undefined;
  const eventData = {
    type: 'NEW_DELIVERY_ORDER',
    deliveryId: targetDeliveryId,
    prescription,
  };

  if (targetDeliveryId) {
    io.to(`delivery_${targetDeliveryId}`).emit('delivery:new_order', eventData);
    io.to(`user_${targetDeliveryId}`).emit('delivery:new_order', eventData);
  }
  io.to('role_delivery').emit('delivery:new_order', eventData);
  io.emit('delivery:new_order', eventData);
};
