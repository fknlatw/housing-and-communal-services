import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class AuthController {
  signin(req,res){
    const {username, password} = req.body;
    if(!username || !password) return res.status(400).json({message: "Заполните все поля"});

    const selectQuery = `SELECT * FROM users WHERE username=?`;

    db.query(selectQuery, [username], (err, result) => {
      if (err) return res.status(500).json({message: "Ошибка при авторизации"});

      if(!result.length) return res.status(400).json({message: `Пользователь с именем ${username} не найден`});

      const user = result[0];

      bcrypt.compare(password, user.password, (err, isValid) => {
        if(err) return res.status(500).json({message: "Ошибка при авторизации"});

        if(!isValid) return res.status(400).json({message: "Неверный пароль"});

        const token = `Bearer ${jwt.sign({id: user.id}, "secret", {expiresIn: "2h"})}`;

        res.cookie("token", token, {httpOnly: true, maxAge: 2 * 60 * 60 * 1000});
        return res.json({message: `Авторизация пользователя ${username} прошла успешно`});
      })
    });
  }

  signup(req,res){
    const {username, password} = req.body;
    if(!username || !password) return res.status(400).json({message: "Заполните все поля"});

    const selectQuery = `SELECT * FROM users WHERE username=?`;
    const insertQuery = `INSERT INTO users (username,password) VALUES (?,?)`;

    db.query(selectQuery, [username], (err, result) => {
      if (err) return res.status(500).json({message: "Ошибка при регистрации"});

      if(result.length) return res.status(400).json({message: `Пользователь с именем ${username} уже существует`});

      bcrypt.hash(password, 10, (err, hash) => {
        if(err) return res.status(500).json({message: "Ошибка при хэшировании пароля"});

        db.query(insertQuery, [username, hash], (err) => {
          if(err) return res.status(500).json({message: "Ошибка при регистрации"});

          return res.json({message: `Регистрация пользователя ${username} прошла успешно`});
        });
      })
    });
  }



  logout(req,res){
    const cookie = req.cookies.token;
    if(!cookie) return res.status(400).json({message: "Вы не авторизованы"});

    res.clearCookie();
    return res.status(200).json({message: "Вы успешно вышли из системы"});
  }
}

export default new AuthController;