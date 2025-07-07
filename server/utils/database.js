const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    this.paths = {
      users: './users.json',
      shops: './shops.json',
      messages: './messages.json',
      orders: './orders.json'
    };
  }

  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async getUsers() {
    return await this.readFile(this.paths.users);
  }

  async saveUsers(users) {
    await this.writeFile(this.paths.users, users);
  }

  async getShops() {
    return await this.readFile(this.paths.shops);
  }

  async saveShops(shops) {
    await this.writeFile(this.paths.shops, shops);
  }

  async getMessages() {
    return await this.readFile(this.paths.messages);
  }

  async saveMessages(messages) {
    await this.writeFile(this.paths.messages, messages);
  }

  async getOrders() {
    return await this.readFile(this.paths.orders);
  }

  async saveOrders(orders) {
    await this.writeFile(this.paths.orders, orders);
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users.find(u => u.id === userId);
  }

  async getShopById(shopId) {
    const shops = await this.getShops();
    return shops.find(s => s.id === shopId);
  }

  async updateUser(userId, updates) {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await this.saveUsers(users);
      return users[userIndex];
    }
    return null;
  }
}

module.exports = new Database();