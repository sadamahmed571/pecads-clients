   // --- تهيئة عامة ---
        let currentSugarType = 'fasting';
        let currentMedFreq = '';

        // --- وظائف النوافذ المنبثقة (Modals) ---
        function toggleModal(id) {
            const modal = document.getElementById(id);
            modal.classList.toggle('active');
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }

        // --- وظائف الحجز الذكي ---
        function selectWallet(name, details) {
            document.querySelectorAll('.wallet-card').forEach(c => c.classList.remove('border-medical', 'bg-medical/5'));
            event.currentTarget.classList.add('border-medical', 'bg-medical/5');
            document.getElementById('selectedWallet').value = name;
            showToast(`تم اختيار ${name}: ${details}`);
        }

        // تبديل أزرار الحجز
        document.getElementById('newFileBtn')?.addEventListener('click', function() {
            this.classList.add('bg-medical', 'text-white', 'shadow-md');
            this.classList.remove('text-gray-500');
            document.getElementById('existingFileBtn').classList.remove('bg-medical', 'text-white', 'shadow-md');
            document.getElementById('existingFileBtn').classList.add('text-gray-500');
            document.getElementById('firstVisitFields').classList.remove('hidden');
            document.getElementById('fileFields').classList.add('hidden');
        });

        document.getElementById('existingFileBtn')?.addEventListener('click', function() {
            this.classList.add('bg-medical', 'text-white', 'shadow-md');
            this.classList.remove('text-gray-500');
            document.getElementById('newFileBtn').classList.remove('bg-medical', 'text-white', 'shadow-md');
            document.getElementById('newFileBtn').classList.add('text-gray-500');
            document.getElementById('fileFields').classList.remove('hidden');
            document.getElementById('firstVisitFields').classList.add('hidden');
        });

        function sendBookingViaWhatsApp() {
            const form = document.getElementById('bookingForm');
            const isNew = !document.getElementById('firstVisitFields').classList.contains('hidden');
            
            let name = "", age = "", phone = "", fileNum = "";
            if (isNew) {
                name = form.querySelector('input[placeholder="اسم المريض"]').value;
                age = form.querySelector('input[placeholder="عمر المريض"]').value;
                phone = form.querySelector('input[placeholder="رقم الجوال"]').value;
            } else {
                fileNum = form.querySelector('input[placeholder="رقم الملف"]').value;
                phone = form.querySelector('input[placeholder="77xxxxxxx"]').value;
            }

            const apptType = form.querySelector('input[name="appt_type"]:checked')?.value;
            const visitType = document.getElementById('newTypeBtn').classList.contains('bg-medical') ? 'جديد' : 'عودة';
            const date = form.querySelector('input[type="date"]').value;
            const time = form.querySelector('input[type="time"]').value;
            const wallet = document.getElementById('selectedWallet').value || 'غير محدد';
            const receipt = form.querySelector('input[placeholder="رقم إيصال الدفع"]').value;

            if (!phone || (!isNew && !fileNum) || (isNew && !name)) {
                showToast("يرجى إكمال البيانات الأساسية");
                return;
            }

            let text = `*حجز موعد ذكي - بيكادز*%0a`;
            text += `الحالة: ${isNew ? 'زيارة أولى' : 'لدينا ملف'}%0a`;
            if (isNew) {
                text += `الاسم: ${name}%0aالعمر: ${age}%0a`;
            } else {
                text += `رقم الملف: ${fileNum}%0a`;
            }
            text += `جوال: ${phone}%0a`;
            text += `العيادة: ${apptType}%0a`;
            text += `النوع: ${visitType}%0a`;
            text += `الموعد: ${date} ${time}%0a`;
            text += `المحفظة: ${wallet}%0a`;
            text += `الإيصال: ${receipt}`;

            if (window.SharedDB) {
                window.SharedDB.addBooking({
                    isNew, name, age, phone, fileNum, apptType, visitType, date, time, wallet, receipt
                });
                // Small delay to show toast if it's not blocked by window.open
                showToast("تم إرسال الحجز لنظام العيادة بنجاح");
            }

            window.open(`https://wa.me/967771234567?text=${text}`, '_blank');
        }

        // --- وظائف متتبع الأدوية ---
        function setFreq(val) {
            currentMedFreq = val;
            document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('bg-medical', 'text-white'));
            event.target.classList.add('bg-medical', 'text-white');
        }

        function addMedication() {
            const name = document.getElementById('medName').value;
            const dose = document.getElementById('medDose').value;
            if (!name || !currentMedFreq) { showToast("أكمل بيانات الدواء"); return; }

            const table = document.getElementById('medScheduleTable');
            const newRow = document.createElement('div');
            newRow.className = "flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md row-success";
            
            const icon = currentMedFreq.includes('مساء') ? 'fa-moon' : 'fa-sun';
            const iconColor = currentMedFreq.includes('مساء') ? 'text-blue-400' : 'text-warning';

            newRow.innerHTML = `
                <label class="relative flex items-center cursor-pointer">
                    <input type="checkbox" class="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-gray-300 transition-all checked:border-success checked:bg-success med-checkbox" onchange="handleMedCheck(this)">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <i class="fa-solid fa-check text-xs"></i>
                    </span>
                </label>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <p class="font-bold text-sm">${name}</p>
                        <span class="text-[9px] bg-green-50 dark:bg-green-900/30 text-success px-1.5 py-0.5 rounded">${dose}</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">${currentMedFreq}</p>
                </div>
                <i class="fa-solid ${icon} ${iconColor} time-icon"></i>
            `;
            table.prepend(newRow);
            toggleModal('medicineModal');
            updateMedProgress();
            showToast("تمت إضافة الدواء بنجاح");
        }

        function handleMedCheck(el) {
            if (el.checked) {
                el.closest('div.flex').classList.add('celebrate');
                setTimeout(() => el.closest('div.flex').classList.remove('celebrate'), 500);
                showToast("أحسنت! استمر في الالتزام 🌟");
            }
            updateMedProgress();
        }

        function updateMedProgress() {
            const total = document.querySelectorAll('.med-checkbox').length;
            const checked = document.querySelectorAll('.med-checkbox:checked').length;
            const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
            
            document.getElementById('medProgressBar').style.width = percent + '%';
            document.getElementById('medProgressText').innerText = percent + '%';
            document.getElementById('complianceVal').innerText = percent + '%';
            
            const emoji = document.getElementById('healthEmoji');
            if (percent < 30) emoji.innerText = '😔';
            else if (percent < 70) emoji.innerText = '😐';
            else if (percent < 100) emoji.innerText = '😊';
            else emoji.innerText = '💪';
        }

        function openCamera() {
            showToast("جاري تشغيل الكاميرا لتحليل الوصفة (AI)...");
            // محاكاة فتح الكاميرا
        }

        // --- وظائف حاسبة السكر ---
        function setSugarType(type) {
            currentSugarType = type;
            document.getElementById('fastingBtn').classList.toggle('toggle-active', type === 'fasting');
            document.getElementById('nonFastingBtn').classList.toggle('toggle-active', type === 'non-fasting');
            calculateSugar('slider');
        }

        function calculateSugar(source) {
            const slider = document.getElementById('sugarSlider');
            const input = document.getElementById('sugarInput');
            let val = source === 'slider' ? slider.value : input.value;
            
            if (source === 'slider') input.value = val;
            else slider.value = val;

            const display = document.getElementById('sugarValueDisplay');
            const box = document.getElementById('sugarResultBox');
            const message = document.getElementById('sugarMessage');
            const notifyBtn = document.getElementById('notifyDoctorBtn');
            
            display.innerText = val;
            
            // تهيئة القيم اللونية بناءً على النوع (صائم/غير صائم)
            let isDanger = false, isWarning = false;
            if (currentSugarType === 'fasting') {
                if (val < 70 || val > 130) isDanger = true;
                else if (val > 110) isWarning = true;
            } else {
                if (val < 70 || val > 180) isDanger = true;
                else if (val > 140) isWarning = true;
            }

            display.className = "text-5xl font-black transition-all duration-500 drop-shadow-md " + 
                               (isDanger ? 'text-danger' : (isWarning ? 'text-warning' : 'text-success'));
            
            box.className = `p-4 rounded-2xl border transition-all duration-500 ${isDanger ? 'bg-danger/5 border-danger/20' : (isWarning ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20')}`;
            
            if (isDanger) {
                message.innerText = val < 70 ? "تنبيه: هبوط حاد! تناول ملعقة عسل أو عصير فوراً." : "تنبيه: ارتفاع ملحوظ! راجع جرعاتك أو تواصل مع الطبيب.";
                message.className = "font-bold text-danger text-sm";
                notifyBtn.classList.remove('hidden');
            } else if (isWarning) {
                message.innerText = "القراءة مرتفعة قليلاً. قلل من الكربوهيدرات واشرب الماء.";
                message.className = "font-bold text-warning text-sm";
                notifyBtn.classList.add('hidden');
            } else {
                message.innerText = "مستوى طبيعي وممتاز! استمر في المحافظة على نظامك الصحي.";
                message.className = "font-bold text-success text-sm";
                notifyBtn.classList.add('hidden');
            }
        }

        // --- وظائف المدرسة السكرية والقسم الاستشاري ---
        function playVideo(src, title) {
            const modal = document.getElementById('videoPlayerModal');
            document.getElementById('mainVideo').src = src;
            document.getElementById('videoTitle').innerText = title;
            modal.classList.add('active');
            document.getElementById('mainVideo').play();
        }

        function startQuiz() {
            const file = prompt("ادخل رقم ملفك كي تستفيد من النقاط:");
            if (file) {
                document.getElementById('quizPanel').classList.add('quiz-active');
            }
        }

        function handleQuizAnswer(isCorrect) {
            if (isCorrect) {
                showToast("إجابة صحيحة! +10 نقاط رصيد 🎁");
            } else {
                showToast("حاول مرة أخرى! للمعلومة: الفواكه قليلة السكر أفضل.");
            }
            setTimeout(() => {
                document.getElementById('quizPanel').classList.remove('quiz-active');
            }, 2000);
        }

        function sendConsultWhatsApp() {
            const file = document.getElementById('consultFileNum').value;
            const topic = document.getElementById('consultTopic').value;
            const msg = document.getElementById('consultMsg').value;
            
            if (!file || !topic || !msg) { showToast("أكمل بيانات الاستشارة"); return; }
            
            let text = `*استشارة سريعة بيكادز*%0aرقم الملف: ${file}%0aالموضوع: ${topic}%0aالتفاصيل: ${msg}`;
            window.open(`https://wa.me/967771234567?text=${text}`, '_blank');
        }

        // --- الوضع الليلي ---
        function toggleTheme() {
            document.body.classList.toggle('dark');
            localStorage.setItem('picads_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        }

        window.onload = () => {
            if (localStorage.getItem('picads_theme') === 'dark') document.body.classList.add('dark');
            updateMedProgress();
            calculateSugar('slider');
        };

        // وظائف الطوارئ
        function showEmergencyPopup() {
            document.getElementById('emergencyPopup').classList.add('show');
            document.getElementById('popupOverlay').classList.add('show');
        }
        function closeEmergencyPopup() {
            document.getElementById('emergencyPopup').classList.remove('show');
            document.getElementById('popupOverlay').classList.remove('show');
        }

        // تبديل أزرار نوع الزيارة في المودال
        document.getElementById('newTypeBtn')?.addEventListener('click', function() {
            this.classList.add('bg-medical', 'text-white');
            document.getElementById('returnTypeBtn').classList.remove('bg-medical', 'text-white');
            document.getElementById('returnTypeBtn').classList.add('text-gray-500');
        });
        document.getElementById('returnTypeBtn')?.addEventListener('click', function() {
            this.classList.add('bg-medical', 'text-white');
            document.getElementById('newTypeBtn').classList.remove('bg-medical', 'text-white');
            document.getElementById('newTypeBtn').classList.add('text-gray-500');
        });