export type Locale = 'lv' | 'ru' | 'en'

const messages = {
  lv: {
    language: 'Valoda', onlineBooking: 'Tiešsaistes pieraksts', myAccount: 'Mans konts', admin: 'Administrācija',
    createAccount: 'Izveidot kontu', bookVisit: 'Pieteikt vizīti', booking: 'Tiešsaistes pieraksts',
    homeText: 'Reģistrējieties vienreiz, saglabājiet savas automašīnas un izvēlieties brīvu vienas stundas laiku.',
    hours: 'Darba laiks: katru dienu 09:00–21:00 pēc iepriekšēja pieraksta. 23. un 24. jūnijā slēgts.',
    login: 'Pieteikties', logout: 'Iziet', register: 'Reģistrācija', name: 'Vārds', phone: 'Tālrunis', password: 'Parole',
    noAccount: 'Nav konta?', hasAccount: 'Jau ir konts?',
    loginLoading: 'Notiek pieteikšanās...', createLoading: 'Konta izveide...',
    registrationSuccessTitle: 'Reģistrācija veiksmīga!', registrationSuccessText: 'Jūsu konts ir izveidots. Tagad varat pievienot automašīnas un veikt pierakstu.', continueToAccount: 'Doties uz manu kontu',
    car: 'Jūsu automašīna', selectCar: 'Izvēlieties automašīnu', addCar: 'Pievienot automašīnu', addAnotherCar: 'Pievienot citu automašīnu',
    model: 'Modelis', date: 'Datums', freeTime: 'Brīvais laiks', retry: 'Mēģināt vēlreiz', checkDb: 'Notiek datubāzes pārbaude...', noSlots: 'Brīvu laiku nav.',
    bookingDateRange: 'Pieraksts pieejams tuvāko 30 dienu laikā.',
    book: 'Rezervēt', booked: 'Pieraksts izveidots.', bookingSuccessTitle: 'Pieraksts veiksmīgi izveidots!', bookingSuccessText: 'Paldies! Jūsu pieraksts ir apstiprināts. Informāciju varat apskatīt savā kontā.', goToAccount: 'Doties uz manu kontu', bookAnother: 'Veikt vēl vienu pierakstu',
    dbUnavailable: 'Datubāze īslaicīgi nav pieejama. Brīvie laiki netiek rādīti. Nospiediet “Mēģināt vēlreiz”.',
    bookingFailed: 'Neizdevās izveidot pierakstu.', slotUnavailable: 'Šis laiks jau ir aizņemts. Izvēlieties citu.',
    bookingLimit: 'Sasniegts pierakstu limits — 10 pieraksti 30 dienu laikā.', carBookingLimit: 'Šai automašīnai sasniegts limits — 5 pieraksti 30 dienu laikā.',
    loginFailed: 'Nepareizs e-pasts vai parole.', emailRegistered: 'Šis e-pasts jau ir reģistrēts.', registerFailed: 'Neizdevās izveidot kontu.',
    account: 'Mans konts', myCars: 'Manas automašīnas', upcoming: 'Gaidāmie pieraksti', history: 'Pierakstu vēsture', cancel: 'Atcelt',
    edit: 'Rediģēt', save: 'Saglabāt', close: 'Aizvērt', editBooking: 'Mainīt pierakstu',
    noUpcoming: 'Gaidāmo pierakstu nav.', noHistory: 'Vēsture pagaidām ir tukša.', newBooking: '+ Jauns pieraksts',
    carLimit: 'Sasniegts maksimālais limits — vienam kontam var būt līdz 10 automašīnām.',
    adminPanel: 'Administrācija', manageBookings: 'Pierakstu pārvaldība', refresh: 'Atjaunot', customer: 'Klients', carLabel: 'Auto', price: 'Cena', status: 'Statuss', action: 'Darbība', noBookings: 'Pierakstu nav.',
    needLogin: 'Jāpiesakās kontā.', noAdminAccess: 'Nav administratora piekļuves.', loadFailed: 'Neizdevās ielādēt pierakstus.'
  },
  ru: {
    language: 'Язык', onlineBooking: 'Онлайн-запись', myAccount: 'Личный кабинет', admin: 'Админка',
    createAccount: 'Создать аккаунт', bookVisit: 'Записаться', booking: 'Онлайн-запись',
    homeText: 'Зарегистрируйтесь один раз, сохраните свои автомобили и выберите свободное время на один час.',
    hours: 'Работаем каждый день с 09:00 до 21:00 по записи. 23 и 24 июня закрыто.',
    login: 'Войти', logout: 'Выйти', register: 'Регистрация', name: 'Имя', phone: 'Телефон', password: 'Пароль',
    noAccount: 'Нет аккаунта?', hasAccount: 'Уже есть аккаунт?',
    loginLoading: 'Вход...', createLoading: 'Создание...',
    registrationSuccessTitle: 'Регистрация прошла успешно!', registrationSuccessText: 'Ваш аккаунт создан. Теперь вы можете добавить автомобили и записаться на мойку.', continueToAccount: 'Перейти в личный кабинет',
    car: 'Ваш автомобиль', selectCar: 'Выберите автомобиль', addCar: 'Добавить автомобиль', addAnotherCar: 'Добавить другой автомобиль',
    model: 'Модель', date: 'Дата', freeTime: 'Свободное время', retry: 'Повторить', checkDb: 'Проверка базы данных...', noSlots: 'Свободных часов нет.',
    bookingDateRange: 'Запись доступна на ближайшие 30 дней.',
    book: 'Забронировать', booked: 'Запись создана.', bookingSuccessTitle: 'Запись успешно создана!', bookingSuccessText: 'Спасибо! Ваша запись подтверждена. Подробности можно посмотреть в личном кабинете.', goToAccount: 'Перейти в личный кабинет', bookAnother: 'Записаться ещё раз',
    dbUnavailable: 'База данных временно недоступна. Свободные часы не показываются. Нажмите «Повторить».',
    bookingFailed: 'Не удалось создать запись.', slotUnavailable: 'Это время уже занято. Выберите другое.',
    bookingLimit: 'Достигнут лимит записей — максимум 10 записей за 30 дней.', carBookingLimit: 'Для этого автомобиля достигнут лимит — максимум 5 записей за 30 дней.',
    loginFailed: 'Неверный email или пароль.', emailRegistered: 'Этот email уже зарегистрирован.', registerFailed: 'Не удалось создать аккаунт.',
    account: 'Личный кабинет', myCars: 'Мои автомобили', upcoming: 'Предстоящие записи', history: 'История записей', cancel: 'Отменить',
    edit: 'Изменить', save: 'Сохранить', close: 'Закрыть', editBooking: 'Изменить запись',
    noUpcoming: 'Предстоящих записей нет.', noHistory: 'История пока пустая.', newBooking: '+ Новая запись',
    carLimit: 'Достигнут максимальный лимит — в одном аккаунте может быть до 10 автомобилей.',
    adminPanel: 'Админка', manageBookings: 'Управление записями', refresh: 'Обновить', customer: 'Клиент', carLabel: 'Авто', price: 'Цена', status: 'Статус', action: 'Действие', noBookings: 'Записей нет.',
    needLogin: 'Нужно войти в аккаунт.', noAdminAccess: 'Нет доступа администратора.', loadFailed: 'Не удалось загрузить записи.'
  },
  en: {
    language: 'Language', onlineBooking: 'Online booking', myAccount: 'My account', admin: 'Admin',
    createAccount: 'Create account', bookVisit: 'Book a visit', booking: 'Online booking',
    homeText: 'Register once, save your cars, and choose a free one-hour appointment.',
    hours: 'Working hours: every day 09:00–21:00 by appointment. Closed 23 and 24 June.',
    login: 'Log in', logout: 'Log out', register: 'Registration', name: 'Name', phone: 'Phone', password: 'Password',
    noAccount: 'No account?', hasAccount: 'Already have an account?',
    loginLoading: 'Signing in...', createLoading: 'Creating...',
    registrationSuccessTitle: 'Registration successful!', registrationSuccessText: 'Your account has been created. You can now add cars and book an appointment.', continueToAccount: 'Go to my account',
    car: 'Your car', selectCar: 'Select a car', addCar: 'Add car', addAnotherCar: 'Add another car',
    model: 'Model', date: 'Date', freeTime: 'Available time', retry: 'Retry', checkDb: 'Checking database...', noSlots: 'No free times available.',
    bookingDateRange: 'Booking is available for the next 30 days.',
    book: 'Book', booked: 'Booking created.', bookingSuccessTitle: 'Booking successfully created!', bookingSuccessText: 'Thank you! Your appointment is confirmed. You can view the details in your account.', goToAccount: 'Go to my account', bookAnother: 'Book another appointment',
    dbUnavailable: 'The database is temporarily unavailable. Free times are not shown. Press “Retry”.',
    bookingFailed: 'Could not create the booking.', slotUnavailable: 'This time is already booked. Choose another.',
    bookingLimit: 'Booking limit reached — maximum 10 bookings within 30 days.', carBookingLimit: 'This car has reached its limit — maximum 5 bookings within 30 days.',
    loginFailed: 'Incorrect email or password.', emailRegistered: 'This email is already registered.', registerFailed: 'Could not create the account.',
    account: 'My account', myCars: 'My cars', upcoming: 'Upcoming bookings', history: 'Booking history', cancel: 'Cancel',
    edit: 'Edit', save: 'Save', close: 'Close', editBooking: 'Edit booking',
    noUpcoming: 'No upcoming bookings.', noHistory: 'No booking history yet.', newBooking: '+ New booking',
    carLimit: 'Maximum limit reached — one account can have up to 10 cars.',
    adminPanel: 'Admin', manageBookings: 'Booking management', refresh: 'Refresh', customer: 'Customer', carLabel: 'Car', price: 'Price', status: 'Status', action: 'Action', noBookings: 'No bookings.',
    needLogin: 'Please log in.', noAdminAccess: 'Administrator access required.', loadFailed: 'Could not load bookings.'
  }
} as const

type MessageKey = keyof typeof messages.en

export function useLocale() {
  const locale = useState<Locale>('bt-locale', () => 'lv')
  if (import.meta.client) {
    onMounted(() => {
      const saved = localStorage.getItem('bt-locale') as Locale | null
      if (saved && ['lv', 'ru', 'en'].includes(saved)) locale.value = saved
    })
  }
  function setLocale(value: Locale) {
    locale.value = value
    if (import.meta.client) localStorage.setItem('bt-locale', value)
  }
  function t(key: MessageKey) { return messages[locale.value][key] ?? messages.en[key] }
  return { locale, setLocale, t, languages: { lv: 'LV', ru: 'RU', en: 'EN' } }
}
