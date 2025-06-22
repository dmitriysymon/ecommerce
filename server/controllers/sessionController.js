const checkSession = (req, res) => {
    if (req.session && req.session.userId) {
      res.status(200).json({ message: 'Сесія активна', userId: req.session.userId });
    } else {
      res.status(401).json({ message: 'Сесія не знайдена' });
    }
  };
  
  module.exports = { checkSession };