const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // POS sends new order to kitchen
  socket.on('NEW_ORDER', (data) => {
    console.log('New order:', data);
    io.emit('NEW_ORDER', data);
  });

  // Kitchen updates order status
  socket.on('UPDATE_ORDER_STATUS', (data) => {
    console.log('Order status update:', data);
    io.emit('UPDATE_ORDER_STATUS', data);
  });

  // Payment done
  socket.on('PAYMENT_DONE', (data) => {
    console.log('Payment done:', data);
    io.emit('PAYMENT_DONE', data);
  });

  // Customer display update
  socket.on('ORDER_UPDATE', (data) => {
    io.emit('ORDER_UPDATE', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
