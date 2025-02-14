const checkSession = (req, res) => {
    if (req.session && req.session.userId) {
      res.status(200).json({ message: 'Сесія активна', userId: req.session.userId });
      console.log('Сесія активна')
    } else {
      res.status(401).json({ message: 'Сесія не знайдена' });
      console.log('Сесія не активна')
    }
  };
  
  module.exports = { checkSession };